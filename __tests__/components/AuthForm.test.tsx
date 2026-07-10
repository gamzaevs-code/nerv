import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AuthForm from '@/components/AuthForm';
import { useRouter } from 'next/navigation';

// Мокаем next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

// Мокаем fetch
global.fetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({
    push: jest.fn(),
    refresh: jest.fn(),
  });
});

describe('AuthForm — login mode', () => {
  beforeEach(() => {
    render(<AuthForm mode="login" />);
  });

  it('отображает заголовок и кнопку входа', () => {
    expect(screen.getByPlaceholderText('you@nerv.local')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ваш пароль')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /войти в нерв/i })).toBeInTheDocument();
  });

  it('отображает ссылку "Забыли пароль?"', () => {
    expect(screen.getByText('Забыли пароль?')).toBeInTheDocument();
  });

  it('отображает ссылку "Зарегистрироваться"', () => {
    expect(screen.getByText('Зарегистрироваться')).toBeInTheDocument();
  });

  it('не отображает поля для регистрации', () => {
    expect(screen.queryByPlaceholderText('Ваше имя')).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Реферальный код')).not.toBeInTheDocument();
  });

  it('отображает кнопки входа через соцсети', () => {
    expect(screen.getByText('Войти через Google')).toBeInTheDocument();
    expect(screen.getByText('Войти через GitHub')).toBeInTheDocument();
  });

  it('вызывает /api/auth/login при отправке формы', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { id: 1, name: 'Test' } }),
    });

    fireEvent.change(screen.getByPlaceholderText('you@nerv.local'), {
      target: { value: 'test@nerv.local' },
    });
    fireEvent.change(screen.getByPlaceholderText('Ваш пароль'), {
      target: { value: 'Password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /войти в нерв/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@nerv.local',
          password: 'Password123',
          twoFactorCode: '',
        }),
      });
    });

    const router = useRouter();
    expect(router.push).toHaveBeenCalledWith('/dashboard');
    expect(router.refresh).toHaveBeenCalled();
  });

  it('отображает ошибку при неудачном входе', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Неверный email или пароль.' }),
    });

    fireEvent.change(screen.getByPlaceholderText('you@nerv.local'), {
      target: { value: 'wrong@nerv.local' },
    });
    fireEvent.change(screen.getByPlaceholderText('Ваш пароль'), {
      target: { value: 'wrong' },
    });
    fireEvent.click(screen.getByRole('button', { name: /войти в нерв/i }));

    await waitFor(() => {
      expect(screen.getByText('Неверный email или пароль.')).toBeInTheDocument();
    });
  });

  it('отображает поле для 2FA кода', () => {
    expect(screen.getByPlaceholderText('Если включена двухфакторная защита')).toBeInTheDocument();
  });
});

describe('AuthForm — signup mode', () => {
  beforeEach(() => {
    render(<AuthForm mode="signup" />);
  });

  it('отображает поля для регистрации', () => {
    expect(screen.getByPlaceholderText('Ваше имя')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('8+ символов, A-Z и цифра')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Необязательно')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Если доступ закрыт')).toBeInTheDocument();
  });

  it('отображает индикатор надёжности пароля', () => {
    expect(screen.getByText('8 символов')).toBeInTheDocument();
    expect(screen.getByText('Заглавная буква')).toBeInTheDocument();
    expect(screen.getByText('Цифра')).toBeInTheDocument();
  });

  it('отображает селект роли', () => {
    expect(screen.getByText('Зритель')).toBeInTheDocument();
    expect(screen.getByText('Игрок')).toBeInTheDocument();
  });

  it('отображает ссылку "Войти" вместо "Зарегистрироваться"', () => {
    expect(screen.getByText('Войти')).toBeInTheDocument();
  });

  it('не отображает кнопки соцсетей', () => {
    expect(screen.queryByText('Войти через Google')).not.toBeInTheDocument();
    expect(screen.queryByText('Войти через GitHub')).not.toBeInTheDocument();
  });

  it('вызывает /api/auth/signup при отправке формы', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { id: 1, name: 'TestUser' } }),
    });

    fireEvent.change(screen.getByPlaceholderText('Ваше имя'), {
      target: { value: 'TestUser' },
    });
    fireEvent.change(screen.getByPlaceholderText('you@nerv.local'), {
      target: { value: 'test@nerv.local' },
    });
    fireEvent.change(screen.getByPlaceholderText('8+ символов, A-Z и цифра'), {
      target: { value: 'Password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /создать аккаунт/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('"name":"TestUser"'),
      });
    });
  });

  it('переключает видимость пароля', () => {
    const passwordInput = screen.getByPlaceholderText('8+ символов, A-Z и цифра');
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleButton = screen.getByLabelText('Показать пароль');
    fireEvent.click(toggleButton);

    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('показывает прогресс пароля при вводе', () => {
    const passwordInput = screen.getByPlaceholderText('8+ символов, A-Z и цифра');

    fireEvent.change(passwordInput, { target: { value: 'a' } });
    expect(screen.getByText('8 символов')).not.toHaveClass('ok');
    expect(screen.getByText('Заглавная буква')).not.toHaveClass('ok');
    expect(screen.getByText('Цифра')).not.toHaveClass('ok');

    fireEvent.change(passwordInput, { target: { value: 'Password1' } });
    const checks = screen.getAllByText(/8 символов|Заглавная буква|Цифра/);
    checks.forEach((check) => {
      expect(check).toHaveClass('ok');
    });
  });
});
