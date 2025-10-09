import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function Confidentiality() {
    const { t, i18n } = useTranslation();
	const isRTL = i18n.language === 'ar';

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* العنوان الرئيسي */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <ShieldCheck className={`w-10 h-10 text-[var(--color-text)] ${isRTL ? "ml-2" : "mr-2"}`} />
            <h1 className="text-3xl font-extrabold sm:text-4xl text-[var(--color-text)]">
              {t("privacy.title")}
            </h1>
          </div>
          <p className="text-lg max-w-2xl mx-auto text-[var(--color-text-secondary)]">
            {t("privacy.subtitle")}
          </p>
        </div>

        {/* محتوى سياسة الخصوصية */}
        <div className="overflow-hidden">
          {/* المقدمة */}
          <div className="p-6 sm:p-8 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">
              {t("privacy.introduction.title")}
            </h2>
            <div className="space-y-4 leading-relaxed text-[var(--color-text-secondary)]">
              {t("privacy.introduction.content", { returnObjects: true }).map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* البيانات التي نجمعها */}
          <div className="p-6 sm:p-8 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">
              {t("privacy.dataCollection.title")}
            </h2>
            <div className="space-y-4 leading-relaxed text-[var(--color-text-secondary)]">
              {t("privacy.dataCollection.content", { returnObjects: true }).map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* الأطراف الأخرى */}
          <div className="p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">
              {t("privacy.thirdParties.title")}
            </h2>
            <div className="space-y-4 leading-relaxed text-[var(--color-text-secondary)]">
              {t("privacy.thirdParties.content", { returnObjects: true }).map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
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

export default Confidentiality;