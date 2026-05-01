import { getTranslations } from 'next-intl/server';
import { Link } from '../../../navigation';
import Navbar from '../../../components/layout/Navbar';
import ToolsDirectory from '../../../components/layout/ToolsDirectory';
import Footer from '../../../components/layout/Footer';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: 'Terms of Service | Refinedocs',
    description: 'Terms of Service and Conditions for using Refinedocs.',
    alternates: {
      canonical: `https://refinedocs.com/${locale}/terms`,
    },
    openGraph: {
      title: 'Terms of Service | Refinedocs',
      description: 'Terms of Service and Conditions for using Refinedocs.',
      url: `https://refinedocs.com/${locale}/terms`,
      type: 'website',
    },
  };
}

export default async function TermsPage() {
  const tCommon = await getTranslations('Common');
  
  return (
    <div className="min-h-screen bg-white dark:bg-[#111111] text-black dark:text-white font-sans selection:bg-[#d4ff33] selection:text-black">
      <Navbar />
      
      <main className="py-20 px-6 sm:px-12">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-[#d4ff33] hover:underline mb-12 inline-block text-sm">
          ← {tCommon('home')}
        </Link>
        <h1 className="text-2xl font-bold mb-16 tracking-tight">{tCommon('termsConditions')}</h1>
        <div className="prose prose-sm prose-invert max-w-none text-[14px] font-normal prose-p:text-black dark:text-gray-400 prose-headings:text-[16px] prose-headings:font-medium prose-headings:text-black dark:text-white prose-a:text-[#d4ff33] prose-strong:text-black dark:text-white prose-p:leading-10 prose-p:mb-20 prose-headings:mt-32 prose-headings:mb-16 prose-li:mb-8 prose-ul:mb-12 prose-p:indent-8">
          <p className="text-black dark:text-gray-400 mb-20 italic">Douala, April 2026. Replaces the prior versions in their entirety.</p>
          
          <p>These terms govern your use of our website and services such as Refinedocs (collectively, “Services”) and software that we include as part of the Services, including any applications, scripts, instruction sets, and any related documentation (collectively “Software”). By using the Services or Software, you agree to these terms. If you have entered into another agreement with us concerning specific Services or Software, then the terms of that agreement control where it conflicts with these terms. As discussed further in Section 3 below, you retain all rights and ownership you have in your content that you make available through the Services. By using our services, you may upload or otherwise provide files and information and process such files and information using our services (collectively “User Files”).</p>

          <h3 id="1-how-this-agreement-works">1. How this Agreement Works</h3>
          
          <h4 id="1-1-choice-of-law">1.1 Choice of Law</h4>
          <p>Your relationship is with DtempoLabs, a company incorporated under the laws of Cameroon, with its registered offices at Douala Kotto, Cameroon, and the Services and Software are governed by the laws of Cameroon.</p>

          <h4 id="1-2-privacy">1.2 Privacy</h4>
          <p>The <Link href="/privacy">Privacy Notice</Link> governs any personal data you provide to us. By using the Services or Software you agree to the terms of the Privacy Notice.</p>

          <h4 id="1-3-browser-based-usage-data">1.3 Browser-Based Usage Data</h4>
          <p>Whilst using the Services via your web browser, you will share information with Refinedocs about how you use our web-based tools. This shared information is associated with your Refinedocs account (where applicable) and allows us to provide you with a more personalized experience, and helps us improve product quality and features. This data is primarily processed within the browser environment and any data stored on our servers pertains mainly to your account information and preferences.</p>

          <h4 id="1-4-modification">1.4 Modification</h4>
          <p>We may modify, update, or discontinue the Services, Software (including any of their portions or features) at any time without liability to you or anyone else. If we discontinue a Service in its entirety, then we will provide you with a pro rata refund for any unused fees for that Service that you may have prepaid.</p>

          <h3 id="2-use-of-service">2. Use of Service</h3>
          
          <h4 id="2-1-license">2.1 License</h4>
          <p>Subject to your compliance with these terms and the law, you may access and use the Services.</p>

          <h4 id="2-2-refinedocs-intellectual-property">2.2 Refinedocs Intellectual Property</h4>
          <p>We (and our licensors) remain the sole owner of all right, title, and interest in the Services and Software. We reserve all rights not granted under these terms. You are especially not allowed to resell any of our products, Software and/or Services.</p>

          <h4 id="2-3-pre-release-version">2.3 Pre-release Version</h4>
          <p>We may designate the Software or Services, or a feature of the Software or Services, as a pre-release or beta version (“Pre-release Version”). Pre-release Version does not represent the final product and may contain bugs that may cause system or other failures and data loss. We may choose not to commercially release the Pre-release Version. You must promptly cease using the Pre-release Version and destroy all copies of Pre-release Version if we request you to do so, or if we release a commercial version of the Pre-release Version. Any separate agreement we enter into with you governing the Pre-release Version will supersede the provisions on Pre-Release Version set out in this section.</p>

          <h3 id="3-your-content">3. Your Content</h3>
          
          <h4 id="3-1-ownership">3.1 Ownership</h4>
          <p>You retain all rights and ownership of your content. We do not claim any ownership rights to your content.</p>

          <h4 id="3-2-our-access-and-storage">3.2 Our Access and Storage</h4>
          <p>We will only access, view, or process your content in limited ways, primarily to provide the requested service within your browser. Generally, User Files are processed temporarily within the browser environment and are not permanently stored on our servers. We may temporarily hold User Files on our servers solely for the duration of the processing task, after which they are deleted according to our Privacy Notice (Section 6). We only store minimal account-related information (like login credentials and preferences) on our servers as outlined in our Privacy Notice. We do not store copies of your processed documents permanently unless explicitly enabled by a feature you activate (e.g., saving to a connected account, if implemented). We do not store copies of your processed documents permanently unless explicitly enabled by a feature you activate. You should always have a copy of your document saved on your own device.</p>

          <h3 id="4-account-information">4. Account Information</h3>
          <p>You are responsible for all activity that occurs via your account. Please notify Customer Support immediately if you become aware of any unauthorized use of your account. You may not (a) share your account information (except with an authorized account administrator) or (b) use another person’s account. Your account administrator may use your account information to manage your use and access to the Services.</p>

          <h3 id="5-user-conduct">5. User Conduct</h3>
          
          <h4 id="5-1-responsible-use">5.1 Responsible Use</h4>
          <p>You must use the Services responsibly.</p>
          <p>Children under <strong>16</strong> are not allowed to use Refinedocs Services. If you are based in a region with specific digital consent laws, you may only use Refinedocs Services if you are over the age at which you can provide consent under the laws of your country or if verifiable parental consent for your use of our Services has been provided to us. If you are a parent and you learn that your child is using our Services and you don’t want them to, please contact us.</p>

          <h4 id="5-2-misuse">5.2 Misuse</h4>
          <p>You must not misuse the Services, Software, or content that we provide to you as part of the Services or Software. For example, you must not:</p>
          <ul>
            <li>(a) copy, modify, host, stream, sublicense, or resell the Services, Software, or content;</li>
            <li>(b) enable or allow others to use the Service, Software, or content using your account information;</li>
            <li>(c) use the content or Software included in the Services to construct any kind of database;</li>
            <li>(d) access or attempt to access the Services by any means other than the interface we provided or authorized;</li>
            <li>(e) circumvent any access or use restrictions put into place to prevent certain uses of the Services;</li>
            <li>(f) share content or engage in behavior that violates anyone’s Intellectual Property Right (“Intellectual Property Rights” means copyright, moral rights, trademark, trade dress, patent, trade secret, unfair competition, right of privacy, right of publicity, and any other proprietary rights.);</li>
            <li>(i) attempt to disable, impair, or destroy the Services, software, or hardware;</li>
            <li>(k) engage in chain letters, junk mails, pyramid schemes, spamming, or other unsolicited messages;</li>
            <li>(l) place advertisement of any products or services in the Services except with our prior written approval;</li>
            <li>(m) use any data mining or similar data gathering and extraction methods in connection with the Services;</li>
            <li>(n) violate applicable law; or</li>
            <li>(o) encrypt or protect files in countries where this is prohibited</li>
          </ul>

          <h3 id="6-fees-and-payment">6. Fees and Payment</h3>
          
          <h4 id="6-1-fees">6.1 Fees, Third-Party Fees and Taxes</h4>
          <p>Our current fees and prices for our services can be found on our <Link href="/#price">Pricing Section</Link>. Our fees and prices are subject to change. If we change the fees and prices, we will inform you of the new fees and prices one month in advance on the mentioned website or by contacting you via email. If you do not want to accept the new fees and prices, you may terminate the Services/this Agreement within this month over your account page or by contacting us via email or in writing.</p>
          <p>If you buy any of our paid Services or credit packages, you agree to pay us the applicable fees, any applicable taxes and any applicable third-party fee (including, for example, fees charged by our payment processor, Chariow). We are not responsible for these fees of third parties you have engaged. Contact your financial institution with questions about fees. We may take steps to collect the fees you owe us. You are responsible for all related collection costs and expenses.</p>

          <h4 id="6-2-payment-information">6.2 Payment Information</h4>
          <p>Payment information is securely handled by our payment processor, Chariow (<a href="https://chariow.com/privacy">Chariow Privacy Policy</a>). We do not store your full credit card number or other sensitive payment details on our servers. If you do not notify us of updates to your payment method, to avoid interruption of your service, we may rely on Chariow&apos;s systems (or similar services) to attempt to update your payment information, and you authorize us to continue billing your account with the updated information that we obtain.</p>

          <h4 id="6-3-billing">6.3 Billing</h4>
          <p>We will automatically bill the membership fee or credit package cost based on your selected plan, price, and payment method until your subscription is cancelled or terminated. If you do not cancel your subscription or credit package renewal, it will automatically renew at the end of each billing period.</p>
          <p>You and Refinedocs may cancel or terminate your subscription at any time. Cancellations take effect at the end of the current billing cycle and do not apply retroactively. This means any cancellation will stop future billings but will not result in a refund for amounts already paid, except as required by law or as expressly provided under these Terms.</p>
          <p>If you terminate your subscription prior to the end of the current billing cycle or agreed subscription term, an early termination fee may apply in accordance with Section 10.1.</p>
          <p>Where a refund is issued for any reason, refunds will be processed by our payment processor, Chariow, using the original payment method. Refunds are subject to Chariow&apos;s policies.</p>
          <p>If we are unable to process your payment (for example, due to an expired card or insufficient funds through Chariow), your access to Pro features or credit-dependent features may be temporarily paused — but your subscription will remain active. Our payment processor will continue to retry charging your selected payment method for up to <strong>14</strong> days (the “retry period”).</p>

          <h4 id="6-4-free-tier">6.4 Free Tier / Credits</h4>
          <p>Our free tier provides limited access to certain services based on allocated credits. These credits reset periodically (e.g., monthly) or are consumed as you use the services. Additional credits can be purchased separately. Using the free tier requires providing payment information to set up an account and potentially for automatic credit top-ups if enabled.</p>
          <p>The free tier and initial credit allocation are available to new and existing users as determined by Refinedocs. Refinedocs reserves the right to modify or cancel the free tier or credit allocation offer at any time without reason.</p>

          <h3 id="7-indemnification">7. Your Indemnification Obligations</h3>
          <p>You will indemnify us and our subsidiaries, affiliates, officers, agents, employees, partners, and licensors from any claim, demand, loss, or damages, including reasonable attorneys’ fees, arising out of or related to your content, your use of the Services or Software, or your violation of these terms.</p>

          <h3 id="8-disclaimers">8. Disclaimers of Warranties</h3>
          
          <h4 id="8-1-warranties">8.1 Warranties of Services and Software</h4>
          <p>The Services and Software are provided “AS-IS”. To the maximum extent permitted by law, we disclaim and exclude any and all warranties express or implied, including the implied warranties of non-infringement, merchantability, or fitness for a particular purpose. We make no commitments about the content within the Services. We further disclaim and exclude any and all warranty that (a) the Services or Software will meet your requirements or will be constantly available, uninterrupted, timely, secure, or error-free; (b) the results that may be obtained from the use of the Services or Software will be effective, accurate, or reliable; (c) the quality of the Services or Software will meet your expectations; or that (d) any errors or defects in the Services or Software will be corrected.</p>

          <h4 id="8-2-liability">8.2 Liability for Services and Software, information and templates</h4>
          <p>We specifically disclaim any liability for any actions resulting from your use of any Services or Software. You may use and access the Services or Software at your own discretion and risk, and you are solely responsible for any damage to your computer system or loss of data that results from the use and access of any Service or Software. The information and templates provided by DtempoLabs (&quot;we&quot;, &quot;us&quot; or &quot;our&quot;) on <strong>refinedocs.com</strong> (&quot;website&quot;) and our services are provided for information purposes only. All information on the website is provided in good faith, however under no circumstance we shall have any liability to you as a result of your use and/or your reliance on the information, templates, Services or Software.</p>

          <h4 id="8-3-storage">8.3 Storage of files</h4>
          <p>Our service may offer temporary storage or sharing capabilities for processed files. This functionality relies on temporary server storage or unique URLs. We can&apos;t promise that stored files will always appear to or be accessible by you beyond the immediate processing session unless explicitly saved to a persistent location you control (e.g., your local device, a connected cloud service if implemented). You should always have a copy of your document saved on your own device. We are not responsible for lost documents accessed via temporary links or stored temporarily on our servers after the period specified in our Privacy Notice and cannot be held liable for any loss.</p>

          <h3 id="9-limitation-of-liability">9. Limitation of Liability</h3>
          
          <h4 id="9-1-liability-of-refinedocs">9.1 Liability of Refinedocs</h4>
          <p>Refinedocs is not liable to you or anyone else for: (a) any loss of use, data, goodwill, or profits, whether or not foreseeable; and (b) any special, incidental, indirect, consequential, or punitive damages whatsoever (even if we have been advised of the possibility of these damages), including those (x) resulting from loss of use, data, or profits, whether or not foreseeable, (y) based on any theory of liability, including breach of contract or warranty, negligence or other tortious action, or (z) arising from any other claim arising out of or in connection with your use of or access to the Services or Software. Nothing in these terms limits or excludes our liability for gross negligence, for our (or our employees’) intentional misconduct, or for death or personal injury.</p>

          <h4 id="9-2-limited-liability">9.2 Limited liability</h4>
          <p>Refinedocs’s total liability in any matter arising out of or related to these terms is limited to the aggregate amount that you paid for access to the Service and Software during the three-month period preceding the event giving rise to the liability, or a fixed amount of 10,000 XAF, whichever is higher. This limitation will apply even if we have been advised of the possibility of the liability exceeding the amount and notwithstanding any failure of essential purpose of any limited remedy.</p>

          <h4 id="9-3-limitation">9.3 Limitation</h4>
          <p>The limitations and exclusions in this Section 9 apply to the maximum extent permitted by law.</p>

          <h3 id="10-termination">10. Termination</h3>
          
          <h4 id="10-1-termination-by-you">10.1 Termination by You</h4>
          <p>You may terminate your subscription or account at any time. If you terminate your subscription prior to the end of the current billing cycle or agreed subscription term, an early termination fee may apply.</p>
          <p>Where such termination is exercised on the basis of a statutory right allowing early termination, you agree that early termination fees apply, and that such fees correspond to the portion of the payment that would otherwise have been payable for the remainder of the agreed subscription term.</p>
          <p>Any prepaid fees shall first be applied to the portion of the Services already provided and the applicable early termination fee. Any remaining balance may be refunded on a pro-rata basis, where required by mandatory law or expressly determined by the Company.</p>
          <p>If you do not want to accept new fees and prices, you may terminate the Services / this Agreement in accordance with Section 6.1.</p>

          <h4 id="10-2-termination-by-us">10.2 Termination by Us</h4>
          <p>Refinedocs may terminate the Service/this agreement at any time. If we terminate these terms for reasons other than for cause, then we will make a reasonable effort to notify you at least 30 days prior to termination via the email address you provide to us. We may, at any time, terminate your right to use and access the Services or Software if:</p>
          <ul>
            <li>(a) you breach any provision of these terms (or act in a manner that clearly shows you do not intend to, or are unable to, comply with these terms);</li>
            <li>(b) you fail to make the timely payment of fees for the Software or the Services, if any;</li>
            <li>(c) we are required to do so by law (for example, where the provision of the Services or Software to you is, or becomes, unlawful);</li>
            <li>(d) we elect to discontinue the Services or Software, in whole or in part, (such as if it becomes impractical for us to continue offering Services in your region due to change of law); or</li>
            <li>(e) there has been an extended period of inactivity in your free account.</li>
          </ul>

          <h4 id="10-3-survival">10.3 Survival</h4>
          <p>Upon expiration or termination of these terms, any perpetual licenses you have granted, your indemnification obligations, our warranty disclaimers or limitations of liabilities, and dispute resolution provisions stated in these terms will survive. Upon the expiration or termination of the Services, some or all of the Software may cease to operate without prior notice.</p>

          <h3 id="11-investigations">11. Investigations / Disclosure</h3>
          <p>We may access or disclose information about you, or your use of the Services, (a) when it is required by law; (b) to respond to your requests for customer service support; or (c) when we, in our discretion, think it is necessary to protect the rights, property, or personal safety of us, our users, or the public.</p>

          <h3 id="12-dispute-resolution">12. Dispute Resolution</h3>
          
          <h4 id="12-1-process">12.1 Process</h4>
          <p>For any concern or dispute you may have, you agree to first try to resolve the dispute informally by contacting us. If a dispute is not resolved within 30 days of submission, you or Refinedocs must resolve any claims relating to these terms, the Services, or the Software through final and binding arbitration, except that you or Refinedocs may assert claims before the courts of <strong>Douala, Cameroon</strong>.</p>

          <h4 id="12-2-rules">12.2 Rules</h4>
          <p>If you or Refinedocs decide to resort to arbitration as per the foregoing paragraph, the <strong>Cameroon Mediation and Arbitration Center (CMAC) Rules</strong> will administer the arbitration in <strong>Douala</strong> under the applicable rules. There will be one arbitrator that you and Refinedocs both select. The arbitration will be conducted in the English or French language. Judgment upon the award rendered may be entered and will be enforceable in any court of competent jurisdiction having jurisdiction over the parties.</p>

          <h4 id="12-3-no-class-actions">12.3 No Class Actions</h4>
          <p>You may only resolve disputes with us on an individual basis, and may not bring a claim as a plaintiff or a class member in a class, consolidated, or representative action.</p>

          <h4 id="12-4-injunctive-relief">12.4 Injunctive Relief</h4>
          <p>Notwithstanding the foregoing, in the event of your or others’ unauthorized access to or use of the Services or content in violation of these terms you agree that we are entitled to apply for injunctive remedies (or an equivalent type of urgent legal relief) in any jurisdiction.</p>

          <h3 id="13-compliance">13. Compliance with Licenses</h3>
          <p>If you are a business, company, or organization, then we may, no more than once every 12 months, upon seven 7 days’ prior notice to you, appoint our personnel or an independent third party auditor who is obliged to maintain confidentiality to inspect (including manual inspection, electronic methods, or both) your records, systems, and facilities to verify that your installation and use of any and all Software or Services is in conformity with its valid licenses from us. Additionally, you will provide us with all records and information requested by us in order to verify that its installation and use of any and all Software and Services is in conformity with your valid licenses from us within 30 days of our request. If the verification discloses a shortfall in licenses for the Software or Services, you will immediately acquire any necessary licenses, subscriptions, and any applicable back maintenance and support. If the underpaid fees exceed 5% of the value of the payable license fees, then then you will also pay for our reasonable cost of conducting the verification.</p>

          <h3 id="14-modification-terms">14. Modification</h3>
          <p>We may modify these terms or any additional terms that apply to a Service or Software in order to, for example, reflect changes to the law or changes to our Services or Software. You should look at the terms regularly. We will post notice of modifications to these terms on this page. We will post notice of modified additional terms in the applicable Service or Software. By continuing to use or access the Services or Software after the revisions come into effect, you agree to be bound by the revised terms.</p>

          <h3 id="15-miscellaneous">15. Miscellaneous</h3>
          
          <h4 id="15-1-version">15.1 English/French Version</h4>
          <p>The English and French versions of these terms will be the versions used when interpreting or construing these terms.</p>

          <h4 id="15-2-notice-refinedocs">15.2 Notice to Refinedocs</h4>
          <p>You may send notices to us at the following address: DtempoLabs, Douala Kotto, Cameroon, or via email at <strong>Konwoubuntu@gmail.com</strong>.</p>

          <h4 id="15-3-notice-you">15.3 Notice to You</h4>
          <p>We may notify you by email, postal mail, postings within the Services, or other legally acceptable means.</p>

          <h4 id="15-4-agreement">15.4 Entire Agreement</h4>
          <p>These terms constitute the entire agreement between you and us regarding your use of the Services and Software and supersede any prior agreements between you and us relating to the Services.</p>

          <h4 id="15-5-non-assignment">15.5 Non-Assignment</h4>
          <p>You may not assign or otherwise transfer these terms, or your rights and obligations under these terms, in whole or in part, without our written consent and any such attempt will be void. We may transfer our rights under these terms to a third party.</p>

          <h4 id="15-6-severability">15.6 Severability</h4>
          <p>If a particular term is not enforceable, the unenforceability of that term will not affect any other terms.</p>

          <h4 id="15-7-no-waiver">15.7 No Waiver</h4>
          <p>Our failure to enforce or exercise any of these terms is not a waiver of that section.</p>

          <h3 id="16-dpa">16. Data Processing Agreement</h3>
          <p>The Data Processing Agreement (DPA) reflects our mutual agreement with respect to the Processing of Personal Data by us on behalf of you in connection with our services. The DPA is supplemental to, and forms an integral part of, these Terms of Service. In case of any conflict or inconsistency, the DPA will take precedence over these Terms to the extent of such conflict or inconsistency.</p>
        </div>
        </div>
      </main>

      <ToolsDirectory />
      <Footer />
    </div>
  );
}
