import { Navigate, Route, Routes } from 'react-router-dom';
import { Feed } from '../pages/feed';
import { Login } from '../pages/login';
import { ForgotPassword } from '../pages/forgot-password';
import { ResetPassword } from '../pages/reset-password';
import { ConstructorPage } from '../pages/constructor-page';
import { Profile } from '../pages/profile';
import { ProfileOrders } from '../pages/profile-orders';
import { NotFound404 } from '../pages/not-fount-404';

export const App = () => (
  <Routes>
    <Route path='/login' element={<Login />} />
    <Route path='/' element={<ConstructorPage />} />
    <Route path='/forgot-password' element={<ForgotPassword />} />
    <Route path='/reset-password' element={<ResetPassword />} />
    <Route path='/feed' element={<Feed />} />
    <Route path='/profile/orders' element={<ProfileOrders />} />
    <Route path='/profile' element={<Profile />} />
    <Route path='/*' element={<NotFound404 />} />
  </Routes>
);
