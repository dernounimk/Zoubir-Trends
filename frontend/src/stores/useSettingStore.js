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

      // ────────────────────────────────
      // جلب الإعدادات العامة من السيرفر
      // ────────────────────────────────
      fetchMetaData: async () => {
        try {
          set({ loadingMeta: true });
          const response = await axios.get('/api/settings');
          const settings = response.data;

          // تأكد من أن البيانات ليست undefined
          const safeCategories = Array.isArray(settings.categories) ? settings.categories.filter(Boolean) : [];
          const safeSizes = Array.isArray(settings.sizes) ? settings.sizes.filter(Boolean) : [];
          const safeColors = Array.isArray(settings.colors) ? settings.colors.filter(Boolean) : [];
          const safeDelivery = Array.isArray(settings.delivery) ? settings.delivery.filter(Boolean) : [];

          const sizesLetters = safeSizes.filter(s => s && s.type === 'letter');
          const sizesNumbers = safeSizes.filter(s => s && s.type === 'number');

          set({
            categories: safeCategories,
            sizesLetters,
            sizesNumbers,
            colorsList: safeColors,
            deliverySettings: safeDelivery,
            orderCalculation: settings.orderCalculation || 'all',
          });
        } catch (error) {
          console.error('❌ Failed to fetch metadata:', error);
          toast.error('Failed to load settings');
          
          // تعيين قيم افتراضية في حالة الخطأ
          set({
            categories: [],
            sizesLetters: [],
            sizesNumbers: [],
            colorsList: [],
            deliverySettings: [],
            orderCalculation: 'all'
          });
        } finally {
          set({ loadingMeta: false });
        }
      },

      // ────────────────────────────────
      // تحديث طريقة حساب الطلبات
      // ────────────────────────────────
      updateOrderCalculation: async (orderCalc) => {
        if (!['confirmed', 'all'].includes(orderCalc)) return;
        try {
          set({ loadingMeta: true });
          const response = await axios.put('/api/settings', { orderCalculation: orderCalc });
          
          // تأكد من أن البيانات آمنة
          const safeOrderCalculation = response.data.orderCalculation || 'all';
          
          set({ orderCalculation: safeOrderCalculation });
          toast.success('Order calculation updated');
        } catch (error) {
          console.error('❌ Failed to update order calculation:', error);
          toast.error('Failed to update order calculation');
        } finally {
          set({ loadingMeta: false });
        }
      },

      // ────────────────────────────────
      // تحديث إعدادات التوصيل
      // ────────────────────────────────
      updateDeliverySettings: async (deliverySettings) => {
        try {
          set({ loadingMeta: true });
          const response = await axios.put('/api/settings', { 
            delivery: Array.isArray(deliverySettings) ? deliverySettings : [] 
          });
          
          // تأكد من أن البيانات آمنة
          const safeDelivery = Array.isArray(response.data.delivery) ? response.data.delivery : [];
          
          set({ deliverySettings: safeDelivery });
          toast.success('Delivery settings updated');
        } catch (error) {
          console.error('❌ Failed to update delivery settings:', error);
          toast.error('Failed to update delivery settings');
        } finally {
          set({ loadingMeta: false });
        }
      },

      // ────────────────────────────────
      // إنشاء تصنيف جديد
      // ────────────────────────────────
      createCategory: async ({ name, image }) => {
        try {
          set({ loadingMeta: true });

          if (!name || !image) throw new Error('Name and image are required');

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
            addCategory: { name, imageUrl: imageBase64 },
          });

          // تأكد من أن البيانات آمنة
          const safeCategories = Array.isArray(response.data.categories) ? response.data.categories : [];
          const newCategory = safeCategories.find(c => c && c.name === name);
          
          if (newCategory) {
            set(state => ({ 
              categories: [...state.categories, newCategory].filter(Boolean)
            }));
          }

          toast.success('Category added');
          return newCategory;
        } catch (error) {
          console.error('❌ Failed to create category:', error);
          toast.error(error.response?.data?.message || 'Failed to create category');
          throw error;
        } finally {
          set({ loadingMeta: false });
        }
      },

      // ────────────────────────────────
      // حذف تصنيف
      // ────────────────────────────────
      deleteCategory: async (id) => {
        try {
          set({ loadingMeta: true });
          await axios.put('/api/settings', { removeCategoryId: id });

          set(state => ({
            categories: state.categories.filter(c => c && String(c._id) !== String(id)),
          }));

          toast.success('Category deleted');
        } catch (error) {
          console.error('❌ Failed to delete category:', error);
          toast.error(error.response?.data?.message || 'Failed to delete category');
          throw error;
        } finally {
          set({ loadingMeta: false });
        }
      },

      // ────────────────────────────────
      // إنشاء مقاس جديد (أحرف / أرقام)
      // ────────────────────────────────
      createSize: async ({ type, value }) => {
        const tempId = Date.now().toString();
        try {
          set({ loadingMeta: true });
          if (!value) throw new Error('Value is required');

          const newSizeTemp = {
            _id: tempId,
            name: value,
            type: type === 'letters' ? 'letter' : 'number',
          };

          // تحديث متفائل (قبل حفظ السيرفر)
          set(state => {
            if (type === 'letters') {
              return { sizesLetters: [...state.sizesLetters, newSizeTemp].filter(Boolean) };
            } else {
              return { sizesNumbers: [...state.sizesNumbers, newSizeTemp].filter(Boolean) };
            }
          });

          const response = await axios.put('/api/settings', {
            addSize: { name: value, type: newSizeTemp.type },
          });

          // تأكد من أن البيانات آمنة
          const safeSizes = Array.isArray(response.data.sizes) ? response.data.sizes : [];
          const newSize = safeSizes.find(s => s && s.name === value);
          
          if (newSize) {
            set(state => {
              if (type === 'letters') {
                return {
                  sizesLetters: state.sizesLetters.map(s =>
                    s && s._id === tempId ? newSize : s
                  ).filter(Boolean),
                };
              } else {
                return {
                  sizesNumbers: state.sizesNumbers.map(s =>
                    s && s._id === tempId ? newSize : s
                  ).filter(Boolean),
                };
              }
            });
          }

          toast.success('Size added');
          return newSize;
        } catch (error) {
          // التراجع عن التحديث المؤقت
          set(state => {
            if (type === 'letters') {
              return { sizesLetters: state.sizesLetters.filter(s => s && s._id !== tempId) };
            } else {
              return { sizesNumbers: state.sizesNumbers.filter(s => s && s._id !== tempId) };
            }
          });

          console.error('❌ Failed to create size:', error);
          toast.error(error.response?.data?.message || 'Failed to create size');
          throw error;
        } finally {
          set({ loadingMeta: false });
        }
      },

      // ────────────────────────────────
      // حذف مقاس
      // ────────────────────────────────
      deleteSize: async (id) => {
        try {
          set({ loadingMeta: true });
          await axios.put('/api/settings', { removeSizeId: id });

          set(state => ({
            sizesLetters: state.sizesLetters.filter(s => s && String(s._id) !== String(id)),
            sizesNumbers: state.sizesNumbers.filter(s => s && String(s._id) !== String(id)),
          }));

          toast.success('Size deleted');
        } catch (error) {
          console.error('❌ Failed to delete size:', error);
          toast.error(error.response?.data?.message || 'Failed to delete size');
          throw error;
        } finally {
          set({ loadingMeta: false });
        }
      },

      // ────────────────────────────────
      // إنشاء لون جديد
      // ────────────────────────────────
      createColor: async ({ name, hex }) => {
        try {
          set({ loadingMeta: true });
          if (!name || !hex) throw new Error('Name and hex are required');

          const response = await axios.put('/api/settings', {
            addColor: { name, hex },
          });

          // تأكد من أن البيانات آمنة
          const safeColors = Array.isArray(response.data.colors) ? response.data.colors : [];
          const newColor = safeColors.find(c => c && c.name === name);
          
          if (newColor) {
            set(state => ({
              colorsList: [...state.colorsList, newColor].filter(Boolean),
            }));
          }

          toast.success('Color added');
          return newColor;
        } catch (error) {
          console.error('❌ Failed to create color:', error);
          toast.error(error.response?.data?.message || 'Failed to create color');
          throw error;
        } finally {
          set({ loadingMeta: false });
        }
      },

      // ────────────────────────────────
      // حذف لون
      // ────────────────────────────────
      deleteColor: async (id) => {
        try {
          set({ loadingMeta: true });
          await axios.put('/api/settings', { removeColorId: id });

          set(state => ({
            colorsList: state.colorsList.filter(c => c && String(c._id) !== String(id)),
          }));

          toast.success('Color deleted');
        } catch (error) {
          console.error('❌ Failed to delete color:', error);
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
        categories: Array.isArray(state.categories) ? state.categories.filter(Boolean) : [],
        sizesLetters: Array.isArray(state.sizesLetters) ? state.sizesLetters.filter(Boolean) : [],
        sizesNumbers: Array.isArray(state.sizesNumbers) ? state.sizesNumbers.filter(Boolean) : [],
        colorsList: Array.isArray(state.colorsList) ? state.colorsList.filter(Boolean) : [],
        deliverySettings: Array.isArray(state.deliverySettings) ? state.deliverySettings.filter(Boolean) : [],
        orderCalculation: state.orderCalculation || 'all',
      }),
    }
  )
);

export default useSettingStore;