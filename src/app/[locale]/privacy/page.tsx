import { getTranslations } from 'next-intl/server';
import { Link } from '../../../navigation';
import Navbar from '../../../components/layout/Navbar';
import ToolsDirectory from '../../../components/layout/ToolsDirectory';
import Footer from '../../../components/layout/Footer';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: 'Privacy Policy | Refinedocs',
    description: 'Privacy Policy for Refinedocs services and tools.',
    alternates: {
      canonical: `https://refinedocs.com/${locale}/privacy`,
    },
    openGraph: {
      title: 'Privacy Policy | Refinedocs',
      description: 'Privacy Policy for Refinedocs services and tools.',
      url: `https://refinedocs.com/${locale}/privacy`,
      type: 'website',
    },
  };
}

export default async function PrivacyPage() {
  const tCommon = await getTranslations('Common');
  
  return (
    <div className="min-h-screen bg-white dark:bg-[#111111] text-black dark:text-white font-sans selection:bg-[#d4ff33] selection:text-black">
      <Navbar />
      
      <main className="py-20 px-6 sm:px-12">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-[#d4ff33] hover:underline mb-12 inline-block text-sm">
          ← {tCommon('home')}
        </Link>
        <h1 className="text-2xl font-bold mb-16 tracking-tight">{tCommon('privacyNotice')}</h1>
        <div className="prose prose-sm prose-invert max-w-none text-[14px] font-normal prose-p:text-black dark:text-gray-400 prose-headings:text-[16px] prose-headings:font-medium prose-headings:text-black dark:text-white prose-a:text-[#d4ff33] prose-strong:text-black dark:text-white prose-p:leading-10 prose-p:mb-20 prose-headings:mt-32 prose-headings:mb-16 prose-li:mb-8 prose-ul:mb-12 prose-p:indent-8">
          <p className="text-black dark:text-gray-400 mb-20">Last updated: April 14, 2026</p>
          
          <p>We are DtempoLabs, a company incorporated under the laws of Cameroon, with its registered offices at Douala Kotto, Cameroon (<strong>‘Refinedocs’</strong>, <strong>‘we’</strong>, <strong>‘our’</strong>, <strong>‘us’</strong>), also reachable at Konwoubuntu@gmail.com. Legal documents are not easy to read, so in summary, this policy sets out how Refinedocs collects and uses information about you.</p>

          <p>Refinedocs respects your right to privacy when you use our services, visit our website, or communicate with us. We take all necessary measures to ensure that any personal data you give us is treated in compliance with applicable data protection laws and with this Privacy Notice.</p>

          <p>‘Personal Data’ is any information that relates to an identified or identifiable natural person, such as your name or email address. In exchange for our services, when you visit our website or communicate with us, we may process Personal data related to you (‘Your Personal Data’). In these cases, DtempoLabs is the controller of Your Personal Data.</p>

          <p>When you upload or otherwise provide files and information, which may contain personal data related to you or others, and process such files and information using our services (‘User Files’), you remain fully responsible for such personal data contained in the User Files.</p>

          <p>In the paragraphs below, we endeavor to provide you with information about our processing of Your Personal Data, your rights regarding Your Personal Data, and the measures we take to maintain the privacy and security of Your Personal Data.</p>

          <p>If you provide us with the personal data of other people (such as family members or work colleagues) or provide us User Files which contain personal data related to other people, please make sure they are aware of this Privacy Notice and only provide us with their data if you are allowed to do so and such personal data is correct.</p>

          <p>Our website and communications may contain links to other websites. If you follow a link to any of those websites, please note that the personal information you submit will be processed according to their own privacy notices, and Refinedocs does not accept any responsibility or liability for those websites. Please make sure to check those privacy notices before you submit any personal information to those websites.</p>

          <p>This Privacy Notice has been drafted to be in line with applicable privacy laws. Based on your location, this might, for example, be the Cameroon Data Protection Law or potentially relevant international frameworks like GDPR principles depending on where you reside.</p>

          <p>Please note that the following information may be reviewed and amended occasionally. Therefore, DtempoLabs recommends regularly checking this privacy policy for any updates.</p>

          <h3 id="faqs">FAQs:</h3>

          <h4 id="faq-1">1. What personal data does Refinedocs collect through its website and for what purposes?</h4>
          <p>In brief: If you use our services, regardless of whether you are a free or paying user, we will collect Your Personal Data as required to provide our services to you and/or help us improve our services for you.</p>

          <h5 id="faq-1-1">1.1 Use of our website</h5>
          <p>If you visit any domain or subdomain of <a href="https://refinedocs.com">refinedocs.com</a> and do not register for or log into your account, we collect and process Your Personal Data that is necessary to enable your informational use of these domains. We also use functional cookies and other technologies (see Section 8) to enable this functional use of our website and to maintain its stability and security. For these purposes, we process your IP address and other usage metrics along with the date and time of your access. We process Your Personal Data to provide our website to you (e.g., Art. 6 (1) b GDPR) and based on our legitimate interest in maintaining our website’s stability and security (e.g., Art. 6 (1) f GDPR).</p>

          <h5 id="faq-1-2">1.2 User Account</h5>
          <p>All accounts created in our app are managed via Google third-party services (Firebase), so we do not store your direct login credentials.</p>
          <p>For Google, this involves us processing your name, surname, email address, and public profile information (e.g. profile picture).</p>
          <p>The third-party platform may ask for your consent to share this data with us. As the personal data we may process under this option was originally collected by the third-party platform, the initial data processing and sharing of the data with us is governed by the privacy policy of such third-party platforms (Google). Please refer to the relevant third-party platform and/or its settings, if you want to deactivate the connection between the third-party platform and us.</p>
          <p>We process Your Personal Data to set up your user account and, thus, form a contractual relationship (e.g., Art. 6 (1) b GDPR).</p>
          <p>For security reasons, we also process the time, browser, IP address of your last login, and the time of your last password reset. We have a legitimate interest to process this information to filter out suspicious login requests and to detect and prevent abuse of your user credentials (e.g., Art. 6 (1) f GDPR).</p>

          <h5 id="faq-1-3">1.3 Refinedocs Pro subscription / Paid Plans / Credits</h5>
          <p>During registration of your user account or later on, you may provide Your Personal Data as part of your profile if you purchase any of our paid subscriptions (Refinedocs Pro / Annual Plan) or additional credits. These types of personal data vary based on the type of account, the type of subscription, and the payment method you choose. These types of data may generally include your name, address, which subscription plan you are on or which credit package you purchased, your payment method information (processed securely by our payment processor, Chariow), your VAT or other tax number (if applicable), user settings, your company (if applicable), role (if applicable), and employee status (if applicable).</p>
          <p>We process Your Personal Data to suggest the right type of subscription or credit package for your needs to you and to complete your purchase. The data processing serves to conclude and fulfill the subscription contract or credit purchase agreement between you and us (e.g., Art. 6 (1) b GDPR).</p>

          <h6 id="faq-1-3-a">a) Payment</h6>
          <p>We use payment data and information on your subscription, credit package, and payment history (subscription plan, credit amount, billing period, etc.) to process the regular payments for your Refinedocs subscription or credit purchases and, thus, fulfill our contract (e.g., Art. 6 (1) b GDPR). We accomplish this through our third-party payment processor, <a href="https://chariow.com/privacy">Chariow</a>. We also use Chariow as a subscription management provider. For further information on this provider, please visit section 4 below.</p>
          <p><strong>Note:</strong> Chariow handles full payment details securely; Refinedocs only receives confirmation and transaction IDs.</p>

          <h6 id="faq-1-3-b">b) Invoices</h6>
          <p>We process your account, subscription, credit package, and payment information to fulfill our legal obligations (legal data storage obligations, e.g. under tax law) (e.g., Art. 6 (1) c GDPR) and provide you with invoices under our contract (e.g., Art. 6 (1) b GDPR). We also use Chariow as a subscription management provider to help us in providing the aforementioned services.</p>

          <h5 id="faq-1-4">1.4 Use of our services / User Files</h5>
          <p>If you choose to use our document processing services (e.g., PDF to Excel, Word, CSV conversion, background removal, text extraction, compression) and upload or otherwise provide User Files for this purpose, we process the User Files and metadata (such as file size, file name, and file type). Such files and information may contain personal data related to you or others and you remain fully responsible for any personal data contained in the User Files. We process this information in order to provide you with our document processing services (e.g., Art. 6 (1) b GDPR).</p>
          <p>By default, the documents you process using our services are processed locally in your browser when possible. For AI-powered features, files are transmitted securely and deleted after processing.</p>

          <h5 id="faq-1-5">1.5 Email communication, including customer support, newsletters, and other marketing emails</h5>
          <p>When you communicate with us via email, including for customer support, you provide us with your email address and may provide us with your name, contact details, and other personal data, including the content of your email. We process this information to answer your request (e.g., Art. 6 (1) b GDPR).</p>
          <p>We may send you our newsletter or other marketing emails, generally only with your consent (e.g., Art. 6 (1) a GDPR). However, where you have already purchased products and/or services from us, we may inform you about our similar products or services via email. Please note that you can opt out of such email communication by clicking on the unsubscribe link at the end of each marketing email.</p>

          <h5 id="faq-1-6">1.6 Service improvement and error detection</h5>
          <p>For our website and services, we may process information on your default system language, your device, your usage of our services, and information on the pages of our website that you have visited. For error detection, we aggregate this information by shortening your IP address. We only use this information in this aggregated form. We have a legitimate interest to use this information for service improvement (e.g., Art. 6 (1) f GDPR).</p>

          <h5 id="faq-1-7">1.7 Surveys & User Feedback</h5>
          <p>We occasionally conduct voluntary surveys to collect user feedback. For some of these surveys, we may process Your Personal Data, such as your name, email, and IP address. In other cases, we only collect aggregated information. We process this information under our legitimate interest to collect user feedback (e.g., Art. 6 (1) f GDPR).</p>

          <h4 id="faq-2">2. How does Refinedocs protect Your Personal Data?</h4>
          <p>In brief: Ensuring the safety and security of our service and Your Personal Data is a priority.</p>
          <p>DtempoLabs uses appropriate technical and organizational measures to protect Your Personal Data. Only authorized DtempoLabs staff or third-party company staff (i.e. service providers) have access to Your Personal Data. All such staff are required to adhere to our Privacy Notice. All communication and file transfers to and from our server are encrypted with TLS. Passwords are only stored in encrypted (hashed) form, never in plain text.</p>

          <h4 id="faq-3">3. How does Refinedocs use Your Personal Data?</h4>
          <p>In brief: We use Your Personal Data to provide you with high-quality services. Your privacy is our priority. We would not use Your Personal Data for any unlawful purposes.</p>
          <p>We process Your Personal Data for the purposes listed above. In specific cases, Your Personal Data may also be processed to comply with legal obligations, participate in investigations, or assert legal claims.</p>

          <h4 id="faq-4">4. To whom does Refinedocs disclose Your Personal Data, and why?</h4>
          <p>In brief: We share some of Your Personal Data with others in order to provide you with our services. We do not sell Your Personal Data.</p>
          <p>Refinedocs may share Your Personal Data with external service providers (hosting, payment, email, analytics) to ensure professional service quality. Some providers may process Your Personal Data outside the EU/EEA.</p>

          <h5 id="faq-4-1">4.1 Essential providers</h5>
          <p>We use <strong>Chariow</strong> to process payments. Chariow acts as a data controller for payment data; please refer to the <a href="https://chariow.com/privacy">Chariow Privacy Policy</a> for details.</p>
          <ul>
            <li><strong>Google Cloud & Firebase</strong>: Used for hosting, CDN, authentication, and database services.</li>
            <li><strong>Google Analytics</strong>: Used to monitor visitor interactions and improve app quality.</li>
            <li><strong>Resend</strong>: Used for transactional and marketing email communications.</li>
          </ul>

          <h4 id="faq-5">5. What are my data protection rights and how can I exercise them?</h4>
          <p>In brief: You have certain rights over Your Personal Data under data protection laws.</p>
          <p>Depending on your location, you may have the right to withdraw consent, access your data, request rectification/erasure, object to processing, or request data portability. To assert these rights, please contact us at <strong>Konwoubuntu@gmail.com</strong> or via our contact form.</p>

          <h4 id="faq-6">6. How and for how long do we store Your Personal Data?</h4>
          <p>We only keep your login information and license information. <strong>We do not store any files uploaded to our app.</strong> All document processing is done in a way that ensures files are deleted immediately after use.</p>

          <h4 id="faq-7">7. Which data transfers outside the EU/EEA take place?</h4>
          <p>DtempoLabs is located in Cameroon. Your Personal Data may be transferred to recipients in other countries. We ensure such transfers are based on appropriate safeguards like standard contractual clauses.</p>

          <h4 id="faq-8">8. Cookies – how and why does Refinedocs use them?</h4>
          <p>We use a cookie consent tool to manage your preferences. Cookies are used for functional, analytical, and personalization purposes. Functional cookies are necessary for site operation; analytical and advertising cookies require your consent.</p>

          <h4 id="faq-9">9. Does Refinedocs knowingly handle the data of minors?</h4>
          <p>Refinedocs does not knowingly collect data from minors under sixteen. If you discover a minor has been using our website, please notify us at Konwoubuntu@gmail.com.</p>

          <h4 id="faq-10">10. Can Refinedocs change the terms of this Privacy Notice?</h4>
          <p>DtempoLabs may occasionally make changes to this Privacy Notice. Please check this page regularly for updates.</p>

          <h4 id="faq-11">11. Contact us</h4>
          <p>If you have any queries, please contact DtempoLabs at <strong>Konwoubuntu@gmail.com</strong>.</p>

        </div>
        </div>
      </main>

      <ToolsDirectory />
      <Footer />
    </div>
  );
}
