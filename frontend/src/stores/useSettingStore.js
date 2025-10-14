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
          
          // 🔥 تحقق بشكل متعمق من كل مستوى من البيانات
          const data = response?.data || {};
          console.log('📦 Settings API Response:', data); // للتصحيح
          
          // 🔥 تحقق آمن من كل حقل
          const safeCategories = Array.isArray(data.categories) ? data.categories : [];
          const safeSizes = Array.isArray(data.sizes) ? data.sizes : [];
          const safeColors = Array.isArray(data.colors) ? data.colors : [];
          const safeDelivery = Array.isArray(data.delivery) ? data.delivery : [];
          const safeOrderCalc = typeof data.orderCalculation === 'string' ? data.orderCalculation : 'all';

          // 🔥 تصفية الآحجام بشكل آمن
          const sizesLetters = safeSizes.filter(s => 
            s && typeof s === 'object' && s.type === 'letter'
          ) || [];
          
          const sizesNumbers = safeSizes.filter(s => 
            s && typeof s === 'object' && s.type === 'number'
          ) || [];

          set({
            categories: safeCategories,
            sizesLetters,
            sizesNumbers,
            colorsList: safeColors,
            deliverySettings: safeDelivery,
            orderCalculation: safeOrderCalc,
          });
          
          console.log('✅ Settings loaded successfully:', {
            categories: safeCategories.length,
            sizesLetters: sizesLetters.length,
            sizesNumbers: sizesNumbers.length,
            colors: safeColors.length,
            delivery: safeDelivery.length
          });
          
        } catch (error) {
          console.error('❌ Failed to fetch metadata:', error);
          
          // 🔥 بيانات افتراضية شاملة في حالة الخطأ
          set({
            categories: [],
            sizesLetters: [],
            sizesNumbers: [],
            colorsList: [],
            deliverySettings: [],
            orderCalculation: 'all',
          });
          
          toast.error('Failed to load settings');
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
          
          const data = response?.data || {};
          if (data.orderCalculation) {
            set({ orderCalculation: data.orderCalculation });
            toast.success('Order calculation updated');
          }
        } catch (error) {
          console.error('❌ Failed to update order calculation:', error);
          const errorMsg = error.response?.data?.message || 'Failed to update order calculation';
          toast.error(errorMsg);
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
          
          const data = response?.data || {};
          set({ 
            deliverySettings: Array.isArray(data.delivery) ? data.delivery : [] 
          });
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

          if (!name) throw new Error('Name is required');

          let imageBase64 = '';
          if (image && typeof image !== 'string') {
            imageBase64 = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.readAsDataURL(image);
            });
          } else {
            imageBase64 = image || '';
          }

          const response = await axios.put('/api/settings', {
            addCategory: { name, imageUrl: imageBase64 },
          });

          const data = response?.data || {};
          const newCategory = Array.isArray(data.categories) 
            ? data.categories.find(c => c && c.name === name)
            : null;
            
          if (newCategory) {
            set(state => ({ 
              categories: [...(state.categories || []), newCategory] 
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
            categories: (state.categories || []).filter(c => 
              c && String(c._id) !== String(id)
            ),
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
      // إنشاء مقاس جديد
      // ────────────────────────────────
      createSize: async ({ type, value }) => {
        try {
          set({ loadingMeta: true });
          if (!value) throw new Error('Value is required');

          const tempId = Date.now().toString();
          const newSizeTemp = {
            _id: tempId,
            name: value,
            type: type === 'letters' ? 'letter' : 'number',
          };

          // تحديث متفائل
          set(state => {
            if (type === 'letters') {
              return { 
                sizesLetters: [...(state.sizesLetters || []), newSizeTemp] 
              };
            } else {
              return { 
                sizesNumbers: [...(state.sizesNumbers || []), newSizeTemp] 
              };
            }
          });

          const response = await axios.put('/api/settings', {
            addSize: { name: value, type: newSizeTemp.type },
          });

          const data = response?.data || {};
          const newSize = Array.isArray(data.sizes) 
            ? data.sizes.find(s => s && s.name === value)
            : null;
            
          if (newSize) {
            set(state => {
              if (type === 'letters') {
                return {
                  sizesLetters: (state.sizesLetters || []).map(s =>
                    s._id === tempId ? newSize : s
                  ),
                };
              } else {
                return {
                  sizesNumbers: (state.sizesNumbers || []).map(s =>
                    s._id === tempId ? newSize : s
                  ),
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
              return { 
                sizesLetters: (state.sizesLetters || []).filter(s => s._id !== tempId) 
              };
            } else {
              return { 
                sizesNumbers: (state.sizesNumbers || []).filter(s => s._id !== tempId) 
              };
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
            sizesLetters: (state.sizesLetters || []).filter(s => 
              s && String(s._id) !== String(id)
            ),
            sizesNumbers: (state.sizesNumbers || []).filter(s => 
              s && String(s._id) !== String(id)
            ),
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

          const data = response?.data || {};
          const newColor = Array.isArray(data.colors) 
            ? data.colors.find(c => c && c.name === name)
            : null;
            
          if (newColor) {
            set(state => ({
              colorsList: [...(state.colorsList || []), newColor],
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
            colorsList: (state.colorsList || []).filter(c => 
              c && String(c._id) !== String(id)
            ),
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
        categories: state.categories || [],
        sizesLetters: state.sizesLetters || [],
        sizesNumbers: state.sizesNumbers || [],
        colorsList: state.colorsList || [],
        deliverySettings: state.deliverySettings || [],
        orderCalculation: state.orderCalculation || 'all',
      }),
    }
  )
);

export default useSettingStore;