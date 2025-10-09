
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import useSettingStore from '../stores/useSettingStore';

function Faq() {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = React.useState(null);
  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const { deliverySettings } = useSettingStore();
  const [settings, setSettings] = useState(deliverySettings);

  useEffect(() => {
    setSettings(deliverySettings);
  }, [deliverySettings]);

  console.log(deliverySettings);

  const faqItems = [
    { question: t("faq.q1"), answer: t("faq.a1") },
    { question: t("faq.q2"), answer: t("faq.a2") },
    { question: t("faq.q3"), answer: t("faq.a3") },
    { question: t("faq.q4"), answer: t("faq.a4") },
    {
      question: t("faq.q5"),
      answerComponent: (
        <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
          <table className="min-w-full text-right text-[var(--color-text-secondary)] border-[var(--color-border)] rounded-lg text-sm">
            <thead>
              <tr>
                <th className="border border-[var(--color-border)] px-2 py-1">{t("faq.state")}</th>
                <th className="border border-[var(--color-border)] px-2 py-1">{t("faq.officePrice")}</th>
                <th className="border border-[var(--color-border)] px-2 py-1">{t("faq.homePrice")}</th>
                <th className="border border-[var(--color-border)] px-2 py-1">{t("faq.deliveryDays")}</th>
              </tr>
            </thead>
            <tbody>
              {deliverySettings.map((d) => (
                <tr key={d._id}>
                  <td className="border border-[var(--color-border)] px-2 py-1">{d.state}</td>
                  <td className="border border-[var(--color-border)] px-2 py-1">{d.officePrice} {t("revenueUnit")}</td>
                  <td className="border border-[var(--color-border)] px-2 py-1">{d.homePrice} {t("revenueUnit")}</td>
                  <td className="border border-[var(--color-border)] px-2 py-1">
                    {d.deliveryDays === 1 ? t("day") : d.deliveryDays === 2 ? t("twoDays") : `${d.deliveryDays} ${t("days")}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen py-12 p-2 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold sm:text-4xl mb-4 text-[var(--color-text)]">
            {t("faq.title")}
          </h1>
          <p className="text-lg text-[var(--color-text-secondary)]">
            {t("faq.subtitle")}
          </p>
        </div>
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="border border-[var(--color-border)] bg-[var(--color-bg)] rounded-lg overflow-hidden shadow-sm transition-all duration-200"
            >
              <button
                className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
                onClick={() => toggleAccordion(index)}
              >
                <h3 className="text-lg font-semibold text-[var(--color-text)]">
                  {item.question}
                </h3>
                {activeIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-[var(--color-text)]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[var(--color-text)]" />
                )}
              </button>
              <div
                className={`px-6 pb-5 pt-0 transition-all duration-300 rounded-lg ${
                  activeIndex === index ? "block" : "hidden"
                }`}
              >

                {item.answerComponent? item.answerComponent: (
                  <p className="leading-relaxed whitespace-pre-line text-[var(--color-text-secondary)]">{item.answer}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 border border-[var(--color-border)] rounded-lg p-6 text-center bg-[var(--color-bg)]">
          <h3 className="text-lg font-bold sm:text-2xl mb-4 text-[var(--color-text)]">
            {t("faq.needHelp")}
          </h3>
          <p className="mb-4 text-[var(--color-text-secondary)]">
            {t("faq.contactText")}
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-text)]"
          >
            {t("faq.contactButton")}
          </Link>
        </div>
        
      </div>
    </div>
  );
}

export default Faq;