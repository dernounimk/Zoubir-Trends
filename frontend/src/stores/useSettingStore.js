import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const useSettingStore = create(
  persist(
    (set, get) => ({
      categories: [],
      sizesLetters: [],
      sizesNumbers: [],
      colorsList: [],
      deliverySettings: [],
      orderCalculation: 'all',
      loadingMeta: false,

      fetchMetaData: async () => {
        try {
          set({ loadingMeta: true });
          const response = await axios.get('/api/settings');
          const settings = response.data;

          const sizesLetters = (settings.sizes || []).filter(size => size && size.type === 'letter');
          const sizesNumbers = (settings.sizes || []).filter(size => size && size.type === 'number');

          set({
            categories: (settings.categories || []).filter(c => c),
            sizesLetters,
            sizesNumbers,
            colorsList: (settings.colors || []).filter(c => c),
            deliverySettings: (settings.delivery || []).filter(d => d),
            deliverySettings: (settings.delivery || []).filter(d => d),
            orderCalculation: settings.orderCalculation || 'confirmed', // جلب
          });
        } catch (error) {
          console.error('Failed to fetch metadata:', error);
          toast.error('Failed to load settings');
        } finally {
          set({ loadingMeta: false });
        }
      },

      updateOrderCalculation: async (orderCalc) => {
        if (!['confirmed', 'all'].includes(orderCalc)) return;
        try {
          set({ loadingMeta: true });
          const response = await axios.put('/api/settings', { orderCalculation: orderCalc });
          set({ orderCalculation: response.data.orderCalculation });
        } catch (error) {
          console.error('Failed to update order calculation:', error);
          toast.error('Failed to update order calculation');
        } finally {
          set({ loadingMeta: false });
        }
      },

      updateDeliverySettings: async (deliverySettings) => {
        try {
          set({ loadingMeta: true });
          const response = await axios.put('/api/settings', { delivery: deliverySettings });
          set({ deliverySettings: response.data.delivery || [] });
        } catch (error) {
          console.error('Failed to update delivery settings:', error);
        } finally {
          set({ loadingMeta: false });
        }
      },

      createCategory: async ({ name, image }) => {
        try {
          set({ loadingMeta: true });
          
          if (!name || !image) {
            throw new Error('Name and image are required');
          }

          // تحويل الصورة إلى base64 إذا كانت ملف
          let imageBase64 = '';
          if (typeof image !== 'string') {
            imageBase64 = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.readAsDataURL(image);
            });
          } else {
            imageBase64 = image;
          }

          const response = await axios.put('/api/settings', {
            addCategory: {
              name,
              imageUrl: imageBase64
            }
          });

          const newCategory = response.data.categories.find(c => c.name === name);
          if (newCategory) {
            set(state => ({
              categories: [...state.categories, newCategory]
            }));
          }

          return newCategory;
        } catch (error) {
          console.error('Failed to create category:', error);
          toast.error(error.response?.data?.message || 'Failed to create category');
          throw error;
        } finally {
          set({ loadingMeta: false });
        }
      },

      deleteCategory: async (id) => {
        try {
          set({ loadingMeta: true });
          await axios.put('/api/settings', { removeCategoryId: id });
          
          set(state => ({
            categories: state.categories.filter(c => String(c._id) !== String(id))
          }));
        } catch (error) {
          console.error('Failed to delete category:', error);
          toast.error(error.response?.data?.message || 'Failed to delete category');
          throw error;
        } finally {
          set({ loadingMeta: false });
        }
      },

      createSize: async ({ type, value }) => {
  try {
    set({ loadingMeta: true });
    
    if (!value) {
      throw new Error('Value is required');
    }

    // تحديث الحالة محلياً أولاً (Optimistic Update)
    const tempId = Date.now().toString(); // ID مؤقت للعرض
    const newSizeTemp = {
      _id: tempId,
      name: value,
      type: type === 'letters' ? 'letter' : 'number'
    };

    set(state => {
      if (type === 'letters') {
        return { sizesLetters: [...state.sizesLetters, newSizeTemp] };
      } else {
        return { sizesNumbers: [...state.sizesNumbers, newSizeTemp] };
      }
    });

    const response = await axios.put('/api/settings', {
      addSize: { name: value, type: type === 'letters' ? 'letter' : 'number' }
    });

    // تحديث الحالة بالبيانات الحقيقية من الخادم
    const newSize = response.data.sizes.find(s => s.name === value);
    if (newSize) {
      set(state => {
        if (type === 'letters') {
          return {
            sizesLetters: state.sizesLetters.map(s => 
              s._id === tempId ? newSize : s
            )
          };
        } else {
          return {
            sizesNumbers: state.sizesNumbers.map(s => 
              s._id === tempId ? newSize : s
            )
          };
        }
      });
    }

    return newSize;
  } catch (error) {
    // التراجع عن التحديث المتفائل في حالة الخطأ
    set(state => {
      if (type === 'letters') {
        return { sizesLetters: state.sizesLetters.filter(s => s._id !== tempId) };
      } else {
        return { sizesNumbers: state.sizesNumbers.filter(s => s._id !== tempId) };
      }
    });
    
    console.error('Failed to create size:', error);
    toast.error(error.response?.data?.message || 'Failed to create size');
    throw error;
  } finally {
    set({ loadingMeta: false });
  }
},

      deleteSize: async (id) => {
        try {
          set({ loadingMeta: true });
          await axios.put('/api/settings', { removeSizeId: id });
          
          set(state => ({
            sizesLetters: state.sizesLetters.filter(s => String(s._id) !== String(id)),
            sizesNumbers: state.sizesNumbers.filter(s => String(s._id) !== String(id))
          }));
          
        } catch (error) {
          console.error('Failed to delete size:', error);
          toast.error(error.response?.data?.message || 'Failed to delete size');
          throw error;
        } finally {
          set({ loadingMeta: false });
        }
      },

      createColor: async ({ name, hex }) => {
        try {
          set({ loadingMeta: true });
          
          if (!name || !hex) {
            throw new Error('Name and hex are required');
          }

          const response = await axios.put('/api/settings', {
            addColor: { name, hex }
          });

          const newColor = response.data.colors.find(c => c.name === name);
          if (newColor) {
            set(state => ({
              colorsList: [...state.colorsList, newColor]
            }));
          }

          return newColor;
        } catch (error) {
          console.error('Failed to create color:', error);
          toast.error(error.response?.data?.message || 'Failed to create color');
          throw error;
        } finally {
          set({ loadingMeta: false });
        }
      },

      deleteColor: async (id) => {
        try {
          set({ loadingMeta: true });
          await axios.put('/api/settings', { removeColorId: id });
          
          set(state => ({
            colorsList: state.colorsList.filter(c => String(c._id) !== String(id))
          }));
        
        } catch (error) {
          console.error('Failed to delete color:', error);
          toast.error(error.response?.data?.message || 'Failed to delete color');
          throw error;
        } finally {
          set({ loadingMeta: false });
        }
      },
    }),
    {
      name: 'settings-store',
      partialize: (state) => ({ 
        categories: state.categories.filter(c => c),
        sizesLetters: state.sizesLetters.filter(s => s),
        sizesNumbers: state.sizesNumbers.filter(s => s),
        colorsList: state.colorsList.filter(c => c),
        deliverySettings: state.deliverySettings.filter(d => d),
        orderCalculation: state.orderCalculation,
      }),
    }
  )
);

export default useSettingStore;