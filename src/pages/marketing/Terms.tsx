import { LegalDocument } from "@/components/marketing/LegalDocument";
import { TERMS_OF_SERVICE } from "@/content/marketing/legal";

export default function Terms() {
  return <LegalDocument document={TERMS_OF_SERVICE} />;
}
