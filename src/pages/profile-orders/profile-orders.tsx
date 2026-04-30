import { ProfileOrdersUI } from '@ui-pages';
import { TOrder } from '@utils-types';
import { FC, useEffect } from 'react';
import { useSelector, useDispatch } from '../../services/store';
import { getProfileOrders } from '../../services/slices/profileOrdersSlice';

export const ProfileOrders: FC = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getProfileOrders());
  }, [dispatch]);
  const orders = useSelector((state) => state.profileOrders.orders);

  return <ProfileOrdersUI orders={orders} />;
};
