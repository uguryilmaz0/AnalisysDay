"use client";

import { useState } from "react";
import { Shield, FileText, CheckCircle2 } from "lucide-react";

interface KVKKConsentProps {
  onAcceptAll?: (consents: ConsentState) => void;
  requiredConsents?: {
    terms: boolean;
    privacy: boolean;
    kvkk: boolean;
    explicitConsent: boolean;
  };
}

interface ConsentState {
  terms: boolean;
  privacy: boolean;
  kvkk: boolean;
  explicitConsent: boolean;
  errors: string[];
}

export function KVKKConsent({
  onAcceptAll,
  requiredConsents = {
    terms: true,
    privacy: true,
    kvkk: true,
    explicitConsent: true,
  },
}: KVKKConsentProps) {
  const [consents, setConsents] = useState<ConsentState>({
    terms: false,
    privacy: false,
    kvkk: false,
    explicitConsent: false,
    errors: [],
  });

  const handleConsentChange = (key: keyof Omit<ConsentState, "errors">) => {
    const newConsents = {
      ...consents,
      [key]: !consents[key],
      errors: [],
    };
    setConsents(newConsents);
    // Parent component'e her değişiklikte güncel state'i gönder
    onAcceptAll?.(newConsents);
  };

  const handleAcceptAll = () => {
    const allConsents = {
      terms: true,
      privacy: true,
      kvkk: true,
      explicitConsent: true,
      errors: [],
    };
    setConsents(allConsents);
    onAcceptAll?.(allConsents);
  };

  const allAccepted =
    consents.terms &&
    consents.privacy &&
    consents.kvkk &&
    consents.explicitConsent;

  return (
    <div className="space-y-4">
      {/* Hızlı Onay Butonu */}
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
        <button
          type="button"
          onClick={handleAcceptAll}
          disabled={allAccepted}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
        >
          {allAccepted ? (
            <>
              <CheckCircle2 className="h-5 w-5" />
              <span>Tüm Onaylar Verildi</span>
            </>
          ) : (
            <>
              <Shield className="h-5 w-5" />
              <span>Tümünü Onayla</span>
            </>
          )}
        </button>
        <p className="text-xs text-gray-400 text-center mt-2">
          Tüm sözleşmeleri ve KVKK bilgilendirmesini kabul ediyorum
        </p>
      </div>

      {/* Zorunlu Onaylar */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Shield className="h-4 w-4 text-red-400" />
          Zorunlu Onaylar
        </h3>

        {/* Kullanım Koşulları */}
        {requiredConsents.terms && (
          <label className="flex items-start gap-3 p-4 bg-slate-800/50 border border-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-800/70 transition-colors">
            <input
              type="checkbox"
              checked={consents.terms}
              onChange={() => handleConsentChange("terms")}
              required
              className="mt-1 h-5 w-5 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500 bg-slate-700 border-slate-600"
            />
            <div className="flex-1 text-sm">
              <p className="text-white">
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 underline font-semibold"
                >
                  Kullanım Koşulları
                </a>
                &apos;nı okudum ve kabul ediyorum{" "}
                <span className="text-red-400">*</span>
              </p>
            </div>
          </label>
        )}

        {/* Gizlilik Politikası */}
        {requiredConsents.privacy && (
          <label className="flex items-start gap-3 p-4 bg-slate-800/50 border border-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-800/70 transition-colors">
            <input
              type="checkbox"
              checked={consents.privacy}
              onChange={() => handleConsentChange("privacy")}
              required
              className="mt-1 h-5 w-5 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500 bg-slate-700 border-slate-600"
            />
            <div className="flex-1 text-sm">
              <p className="text-white">
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 underline font-semibold"
                >
                  Gizlilik Politikası
                </a>
                &apos;nı okudum ve kabul ediyorum{" "}
                <span className="text-red-400">*</span>
              </p>
            </div>
          </label>
        )}

        {/* KVKK Aydınlatma Metni */}
        {requiredConsents.kvkk && (
          <label className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg cursor-pointer hover:bg-blue-500/20 transition-colors">
            <input
              type="checkbox"
              checked={consents.kvkk}
              onChange={() => handleConsentChange("kvkk")}
              required
              className="mt-1 h-5 w-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 bg-slate-700 border-slate-600"
            />
            <div className="flex-1 text-sm">
              <p className="text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-400" />
                <a
                  href="/kvkk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline font-semibold"
                >
                  KVKK Aydınlatma Metni
                </a>
                &apos;ni okudum ve anladım{" "}
                <span className="text-red-400">*</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Kişisel verilerimin işlenmesi hakkında bilgilendirildim
              </p>
            </div>
          </label>
        )}

        {/* Açık Rıza Beyanı */}
        {requiredConsents.explicitConsent && (
          <label className="flex items-start gap-3 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg cursor-pointer hover:bg-purple-500/20 transition-colors">
            <input
              type="checkbox"
              checked={consents.explicitConsent}
              onChange={() => handleConsentChange("explicitConsent")}
              required
              className="mt-1 h-5 w-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500 bg-slate-700 border-slate-600"
            />
            <div className="flex-1 text-sm">
              <p className="text-white font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-400" />
                Kişisel Veri İşleme Açık Rıza Beyanı{" "}
                <span className="text-red-400">*</span>
              </p>
              <p className="text-gray-300 mt-2 leading-relaxed">
                6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında;
                kimlik bilgilerimin (ad, soyad, e-posta, kullanıcı adı),
                iletişim bilgilerimin ve abonelik işlemlerime ait verilerin{" "}
                <strong className="text-white">AnalysisDay</strong> tarafından{" "}
                <strong className="text-white">
                  platform hizmeti sunulması, üyelik yönetimi, abonelik
                  işlemleri ve iletişim amaçlarıyla
                </strong>{" "}
                işlenmesine, saklanmasına ve üçüncü taraf hizmet sağlayıcılarla
                (Firebase, Cloudinary, Resend) paylaşılmasına{" "}
                <strong className="text-purple-300">açık rıza veriyorum</strong>
                .
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Bu rızanızı dilediğiniz zaman geri çekme hakkına sahipsiniz.
              </p>
            </div>
          </label>
        )}
      </div>

      {/* Hata Mesajları */}
      {consents.errors.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-sm font-semibold text-red-300 mb-2">
            Lütfen eksik onayları tamamlayın:
          </p>
          <ul className="list-disc list-inside text-sm text-red-200 space-y-1">
            {consents.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Bilgilendirme */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
        <p className="text-xs text-gray-400">
          <span className="text-red-400">*</span> işaretli alanlar kayıt için
          zorunludur. KVKK haklarınız hakkında detaylı bilgi için{" "}
          <a
            href="/kvkk"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            KVKK Aydınlatma Metni
          </a>
          &apos;ni inceleyebilirsiniz.
        </p>
      </div>
    </div>
  );
}

// Export validation function for external use
export { validateConsents };

function validateConsents(
  consents: ConsentState,
  required: KVKKConsentProps["requiredConsents"] = {
    terms: true,
    privacy: true,
    kvkk: true,
    explicitConsent: true,
  }
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (required.terms && !consents.terms) {
    errors.push("Kullanım Koşullarını kabul etmelisiniz");
  }
  if (required.privacy && !consents.privacy) {
    errors.push("Gizlilik Politikasını kabul etmelisiniz");
  }
  if (required.kvkk && !consents.kvkk) {
    errors.push("KVKK Aydınlatma Metnini okuduğunuzu onaylamalısınız");
  }
  if (required.explicitConsent && !consents.explicitConsent) {
    errors.push("Kişisel verilerinizin işlenmesi için açık rıza vermelisiniz");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
