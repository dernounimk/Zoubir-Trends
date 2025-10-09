import React from 'react';
import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function Terms() {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* العنوان الرئيسي */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <FileText className={`w-10 h-10 text-[var(--color-text)] ${isRTL ? "ml-2" : "mr-2"}`} />
            <h1 className="text-3xl text-[var(--color-text)] font-extrabold sm:text-4xl">
              {t("terms.title")}
            </h1>
          </div>
          <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
            {t("terms.subtitle")}
          </p>
        </div>

        {/* محتوى شروط الاستخدام */}
        <div className="overflow-hidden">
          {/* المقدمة */}
          <div className="p-6 sm:p-8 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">
              {t("terms.introduction.title")}
            </h2>
            <div className="space-y-4 leading-relaxed text-[var(--color-text-secondary)]">
              <p>{t("terms.introduction.content")}</p>
            </div>
          </div>

          {/* استخدام الموقع */}
          <div className="p-6 sm:p-8 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">
              {t("terms.siteUsage.title")}
            </h2>
            <div className="space-y-4 leading-relaxed text-[var(--color-text-secondary)]">
              <p>{t("terms.siteUsage.content")}</p>
            </div>
          </div>

          {/* الموافقة على الطلبات */}
          <div className="p-6 sm:p-8 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">
              {t("terms.ordersPricing.title")}
            </h2>
            <div className="space-y-4 leading-relaxed text-[var(--color-text-secondary)]">
              {t("terms.ordersPricing.content", { returnObjects: true }).map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* العلامات التجارية */}
          <div className="p-6 sm:p-8 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">
              {t("terms.trademarks.title")}
            </h2>
            <div className="space-y-4 leading-relaxed text-[var(--color-text-secondary)]">
              <p>{t("terms.trademarks.content")}</p>
            </div>
          </div>

          {/* القانون السائد */}
          <div className="p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">
              {t("terms.jurisdiction.title")}
            </h2>
            <div className="space-y-4 leading-relaxed text-[var(--color-text-secondary)]">
              <p>{t("terms.jurisdiction.content")}</p>
            </div>
          </div>
        </div>

        {/* ملاحظة ختامية */}
        <div className="mt-8 text-center font-semibold w-fit m-auto bg-[var(--color-bg)] p-2 rounded-lg text-[var(--color-text)] text-sm">
          <p>{t("terms.lastUpdated")}</p>
        </div>
      </div>
    </div>
  );
}

export default Terms;