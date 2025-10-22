import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from '../lib/axios';
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

      fetchMetaData: async (retryCount = 0) => {
        try {
          set({ loadingMeta: true });
          
          // 🔥 غير إلى '/settings' بدون /api
          const response = await axios.get('/settings');
          
          const data = response?.data || {};
          console.log('📦 Settings API Response:', data);

          const safeCategories = Array.isArray(data.categories) ? data.categories : [];
          const safeSizes = Array.isArray(data.sizes) ? data.sizes : [];
          const safeColors = Array.isArray(data.colors) ? data.colors : [];
          const safeDelivery = Array.isArray(data.delivery) ? data.delivery : [];
          const safeOrderCalc = typeof data.orderCalculation === 'string' ? data.orderCalculation : 'all';

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
          
          // 🔥 حاول إعادة المحاولة مرة واحدة
          if (retryCount < 1 && error.code !== "ECONNABORTED") {
            console.log("Retrying fetch metadata...");
            setTimeout(() => {
              get().fetchMetaData(retryCount + 1);
            }, 2000);
            return;
          }
          
          set({
            categories: [],
            sizesLetters: [],
            sizesNumbers: [],
            colorsList: [],
            deliverySettings: [],
            orderCalculation: 'all',
          });
          
        } finally {
          set({ loadingMeta: false });
        }
      },

      updateOrderCalculation: async (orderCalc) => {
        if (!['confirmed', 'all'].includes(orderCalc)) return;
        try {
          set({ loadingMeta: true });
          // 🔥 غير إلى '/settings' بدون /api
          const response = await axios.put('/settings', { orderCalculation: orderCalc });
          
          const data = response?.data || {};
          if (data.orderCalculation) {
            set({ orderCalculation: data.orderCalculation });
          }
        } catch (error) {
          console.error('❌ Failed to update order calculation:', error);
          const errorMsg = error.response?.data?.message || 'Failed to update order calculation';
        } finally {
          set({ loadingMeta: false });
        }
      },

      updateDeliverySettings: async (deliverySettings) => {
        try {
          set({ loadingMeta: true });
          // 🔥 غير إلى '/settings' بدون /api
          const response = await axios.put('/settings', { 
            delivery: Array.isArray(deliverySettings) ? deliverySettings : [] 
          });
          
          const data = response?.data || {};
          set({ 
            deliverySettings: Array.isArray(data.delivery) ? data.delivery : [] 
          });
        } catch (error) {
          console.error('❌ Failed to update delivery settings:', error);
        } finally {
          set({ loadingMeta: false });
        }
      },

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

          // 🔥 غير إلى '/settings' بدون /api
          const response = await axios.put('/settings', {
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

          return newCategory;
        } catch (error) {
          console.error('❌ Failed to create category:', error);
          throw error;
        } finally {
          set({ loadingMeta: false });
        }
      },

      deleteCategory: async (id) => {
        try {
          set({ loadingMeta: true });
          // 🔥 غير إلى '/settings' بدون /api
          await axios.put('/settings', { removeCategoryId: id });

          set(state => ({
            categories: (state.categories || []).filter(c => 
              c && String(c._id) !== String(id)
            ),
          }));

        } catch (error) {
          console.error('❌ Failed to delete category:', error);
          throw error;
        } finally {
          set({ loadingMeta: false });
        }
      },

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

          // 🔥 غير إلى '/settings' بدون /api
          const response = await axios.put('/settings', {
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

          return newSize;
        } catch (error) {
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
          throw error;
        } finally {
          set({ loadingMeta: false });
        }
      },

      deleteSize: async (id) => {
        try {
          set({ loadingMeta: true });
          // 🔥 غير إلى '/settings' بدون /api
          await axios.put('/settings', { removeSizeId: id });

          set(state => ({
            sizesLetters: (state.sizesLetters || []).filter(s => 
              s && String(s._id) !== String(id)
            ),
            sizesNumbers: (state.sizesNumbers || []).filter(s => 
              s && String(s._id) !== String(id)
            ),
          }));

        } catch (error) {
          console.error('❌ Failed to delete size:', error);
          throw error;
        } finally {
          set({ loadingMeta: false });
        }
      },

      createColor: async ({ name, hex }) => {
        try {
          set({ loadingMeta: true });
          if (!name || !hex) throw new Error('Name and hex are required');

          // 🔥 غير إلى '/settings' بدون /api
          const response = await axios.put('/settings', {
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

          return newColor;
        } catch (error) {
          console.error('❌ Failed to create color:', error);
          throw error;
        } finally {
          set({ loadingMeta: false });
        }
      },

      deleteColor: async (id) => {
        try {
          set({ loadingMeta: true });
          // 🔥 غير إلى '/settings' بدون /api
          await axios.put('/settings', { removeColorId: id });

          set(state => ({
            colorsList: (state.colorsList || []).filter(c => 
              c && String(c._id) !== String(id)
            ),
          }));

        } catch (error) {
          console.error('❌ Failed to delete color:', error);
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