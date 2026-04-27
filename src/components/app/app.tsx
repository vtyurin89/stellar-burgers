import {
  ConstructorPage,
  Feed,
  ForgotPassword,
  Login,
  NotFound404,
  Profile,
  ProfileOrders,
  ResetPassword,
  Register
} from '@pages';
import '../../index.css';
import styles from './app.module.css';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { Modal } from '../modal';
import { OrderInfo } from '../order-info';
import { IngredientDetails } from '../ingredient-details';

import { AppHeader } from '@components';
import { Preloader } from '@ui';

const App = () => {
  const navigate = useNavigate();

  const handleOrderModalClose = () => {
    // TODO кнопка закрытия модального окна
    navigate('/feed');
  };

  return (
    <div className={styles.app}>
      <AppHeader />
      <Routes>
        <Route path='/' element={<ConstructorPage />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/reset-password' element={<ResetPassword />} />
        <Route path='/feed' element={<Feed />} />
        <Route path='/profile/orders' element={<ProfileOrders />} />
        <Route path='/profile' element={<Profile />} />
        <Route
          path='/feed/:number'
          element={
            <Modal title='Детали заказа' onClose={handleOrderModalClose}>
              <OrderInfo />
            </Modal>
          }
        />
        <Route
          path='/ingredients/:id'
          element={
            <Modal title='Ингредиенты' onClose={handleOrderModalClose}>
              <IngredientDetails />
            </Modal>
          }
        />
        <Route
          path='/profile/orders/:number'
          element={
            <Modal title='Число заказов' onClose={handleOrderModalClose}>
              <OrderInfo />
            </Modal>
          }
        />
        <Route path='/*' element={<NotFound404 />} />
      </Routes>
    </div>
  );
};

export default App;
