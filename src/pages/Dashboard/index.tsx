import React, { useState, useEffect } from 'react';

import Header from '../../components/Header';

import api from '../../services/api';

import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';

import { FoodsContainer } from './styles';

interface IFoodPlate {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
  available: boolean;
}

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<IFoodPlate[]>([]);
  const [editingFood, setEditingFood] = useState<IFoodPlate>({} as IFoodPlate);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      const response = await api.get('/foods');
      setFoods(response.data);
    }

    loadFoods();
  }, []);

  async function handleAddFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    try {
      const { name, description, price, image } = food;
      const response = await api.post('/foods', {
        name,
        description,
        price,
        image,
        available: true,
      });

      setFoods([...foods, response.data]);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleUpdateFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    const { name, price, image, description } = food;

    const updatedFood = await api.put(`/foods/${editingFood.id}`, {
      name,
      description,
      price,
      image,
      available: editingFood.available,
    });

    const updatedFoods = foods.map(foodIndex => {
      if (foodIndex.id === updatedFood.data.id) {
        return updatedFood.data;
      }
      return foodIndex;
    });

    setFoods(updatedFoods);
  }

  async function handleDeleteFood(id: number): Promise<void> {
    await api.delete(`/foods/${id}`);
    setFoods(foods.filter(food => food.id !== id));
  }

  function toggleModal(): void {
    setModalOpen(!modalOpen);
  }

  function toggleEditModal(): void {
    setEditModalOpen(!editModalOpen);
  }

  function handleEditFood(food: IFoodPlate): void {
    setEditingFood(food);
    setEditModalOpen(true);
  }

  async function handleEditAvailable(
    food: IFoodPlate,
    available: boolean,
  ): Promise<void> {
    const { name, description, price, image } = food;

    const updatedFood = await api.put(`/foods/${food.id}`, {
      name,
      description,
      price,
      image,
      available,
    });

    console.log(updatedFood.data);

    const updatedFoods = foods.map(foodIndex => {
      if (foodIndex.id === updatedFood.data.id) {
        return updatedFood.data;
      }
      return foodIndex;
    });

    setFoods(updatedFoods);
  }

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
              handleEditAvailable={handleEditAvailable}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
