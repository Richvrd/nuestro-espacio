import { LoginForm } from './LoginForm';
import { logAcceso } from './actions';

export default async function LoginPage() {
  await logAcceso(null, null, '/login');
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card-header">
          <span className="login-ornament">✦</span>
          <h1 className="login-app-title">
            nuestro <em>espacio</em>
          </h1>
          <p className="login-tagline">solo para nosotros</p>
        </div>
        <LoginForm />
        <p className="login-footer-text">acceso privado · solo para nosotros</p>
      </div>
    </div>
  );
}
