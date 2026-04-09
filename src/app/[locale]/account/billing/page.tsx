'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../providers/AuthProvider';
import { getBillingProfile, updateBillingProfile, BillingProfile } from '../../../../lib/firestore/billing';
import { useTranslations, useLocale } from 'next-intl';
import { getCountryList } from '../../../../lib/countries';
import { Mail, Check, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';

export default function BillingPage() {
  const t = useTranslations('Account.pages.billing');
  const locale = useLocale();
  const countryList = getCountryList(locale);
  const { user, loading: authLoading } = useAuth();
  
  const [dataLoading, setDataLoading] = useState(true);

  // Section 1: Billing Address
  const [addressData, setAddressData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    phoneNumber: '',
    country: 'US',
    postalCode: '',
    state: '',
    city: '',
    street: '',
  });
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressSuccess, setAddressSuccess] = useState(false);
  const [addressError, setAddressError] = useState('');

  // Section 2: Billing Email
  const [billingEmail, setBillingEmail] = useState('');
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Section 3: VAT Number
  const [vatNumber, setVatNumber] = useState('');
  const [isSavingVat, setIsSavingVat] = useState(false);
  const [vatSuccess, setVatSuccess] = useState(false);
  const [vatError, setVatError] = useState('');

  // Fetch initial data
  useEffect(() => {
    if (!user) return;
    
    async function loadData() {
      try {
        const profile = await getBillingProfile(user!.uid);
        if (profile) {
          setAddressData({
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            companyName: profile.companyName || '',
            phoneNumber: profile.phoneNumber || '',
            country: profile.country || 'US',
            postalCode: profile.postalCode || '',
            state: profile.state || '',
            city: profile.city || '',
            street: profile.street || '',
          });
          setBillingEmail(profile.billingEmail || user?.email || '');
          setVatNumber(profile.vatNumber || '');
        } else {
          // Pre-fill email from auth if no billing profile exists
          if (user?.email) {
            setBillingEmail(user.email);
          }
        }
      } catch (err) {
        console.error("Failed to load billing profile:", err);
      } finally {
        setDataLoading(false);
      }
    }
    
    loadData();
  }, [user]);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setAddressError('');
    setIsSavingAddress(true);
    setAddressSuccess(false);

    // Basic Validation
    if (!addressData.firstName || !addressData.lastName || !addressData.country || !addressData.city || !addressData.street || !addressData.postalCode) {
      setAddressError("Please fill out all required fields.");
      setIsSavingAddress(false);
      return;
    }

    try {
      await updateBillingProfile(user.uid, addressData);
      setAddressSuccess(true);
      setTimeout(() => setAddressSuccess(false), 3000);
    } catch (err: any) {
      setAddressError(err.message || "Failed to save address info.");
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleSaveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setEmailError('');
    setIsSavingEmail(true);
    setEmailSuccess(false);

    if (!billingEmail || !billingEmail.includes('@')) {
      setEmailError("Please enter a valid email address.");
      setIsSavingEmail(false);
      return;
    }

    try {
      await updateBillingProfile(user.uid, { billingEmail });
      setEmailSuccess(true);
      setTimeout(() => setEmailSuccess(false), 3000);
    } catch (err: any) {
      setEmailError(err.message || "Failed to save billing email.");
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleSaveVat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setVatError('');
    setIsSavingVat(true);
    setVatSuccess(false);

    try {
      await updateBillingProfile(user.uid, { vatNumber });
      setVatSuccess(true);
      setTimeout(() => setVatSuccess(false), 3000);
    } catch (err: any) {
      setVatError(err.message || "Failed to save VAT number.");
    } finally {
      setIsSavingVat(false);
    }
  };

  if (authLoading || dataLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-full max-w-2xl mx-auto w-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-[#d4ff33] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-500 text-sm">Loading billing data...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="p-8 max-w-2xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{t('title')}</h1>
        <p className="text-zinc-400">{t('invoiceInfo')}</p>
      </div>

      <div className="space-y-6">
        
        {/* Section 1: Billing Address */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">{t('billingAddress')}</h2>
            <button className="text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors">{t('close')}</button>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleSaveAddress} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2" htmlFor="firstName">{t('firstName')}</label>
                  <input
                    id="firstName"
                    type="text"
                    value={addressData.firstName}
                    onChange={(e) => setAddressData({...addressData, firstName: e.target.value})}
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#d4ff33] focus:border-transparent transition-all"
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2" htmlFor="lastName">{t('lastName')}</label>
                  <input
                    id="lastName"
                    type="text"
                    value={addressData.lastName}
                    onChange={(e) => setAddressData({...addressData, lastName: e.target.value})}
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#d4ff33] focus:border-transparent transition-all"
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2" htmlFor="companyName">{t('companyName')}</label>
                <input
                  id="companyName"
                  type="text"
                  value={addressData.companyName}
                  onChange={(e) => setAddressData({...addressData, companyName: e.target.value})}
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#d4ff33] focus:border-transparent transition-all"
                  placeholder="ACME Corp"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2" htmlFor="phoneNumber">{t('phoneNumber')}</label>
                <input
                  id="phoneNumber"
                  type="tel"
                  value={addressData.phoneNumber}
                  onChange={(e) => setAddressData({...addressData, phoneNumber: e.target.value})}
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#d4ff33] focus:border-transparent transition-all"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2" htmlFor="country">{t('country')}</label>
                  <select
                    id="country"
                    value={addressData.country}
                    onChange={(e) => setAddressData({...addressData, country: e.target.value})}
                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#d4ff33] focus:border-transparent transition-all appearance-none"
                  >
                    {countryList.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2" htmlFor="postalCode">{t('postalCode')}</label>
                  <input
                    id="postalCode"
                    type="text"
                    value={addressData.postalCode}
                    onChange={(e) => setAddressData({...addressData, postalCode: e.target.value})}
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#d4ff33] focus:border-transparent transition-all"
                    placeholder="ZIP / Postal code"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2" htmlFor="state">{t('state')}</label>
                  <input
                    id="state"
                    type="text"
                    value={addressData.state}
                    onChange={(e) => setAddressData({...addressData, state: e.target.value})}
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#d4ff33] focus:border-transparent transition-all"
                    placeholder="Select or enter state"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2" htmlFor="city">{t('city')}</label>
                  <input
                    id="city"
                    type="text"
                    value={addressData.city}
                    onChange={(e) => setAddressData({...addressData, city: e.target.value})}
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#d4ff33] focus:border-transparent transition-all"
                    placeholder="Enter city"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2" htmlFor="street">{t('street')}</label>
                <input
                  id="street"
                  type="text"
                  value={addressData.street}
                  onChange={(e) => setAddressData({...addressData, street: e.target.value})}
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#d4ff33] focus:border-transparent transition-all"
                  placeholder="Street address, P.O. box, etc."
                />
              </div>

              {addressError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
                  {addressError}
                </div>
              )}

              <div className="pt-2 flex items-center gap-4">
                <button
                  type="submit"
                  disabled={isSavingAddress}
                  className="inline-flex items-center justify-center gap-2 bg-[#d4ff33] text-black px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#c2eb2e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[8rem]"
                >
                  {isSavingAddress ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  ) : t('save')}
                </button>
                {addressSuccess && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 text-sm text-green-400">
                    <Check size={16} /> Saved
                  </motion.span>
                )}
              </div>
            </form>
          </div>
        </section>

        {/* Section 2: Billing Email */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">{t('billingEmail')}</h2>
            <button className="text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors">{t('close')}</button>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleSaveEmail} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2" htmlFor="billingEmail">{t('emailInvoicesTo')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-zinc-500" />
                  </div>
                  <input
                    id="billingEmail"
                    type="email"
                    value={billingEmail}
                    onChange={(e) => setBillingEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#d4ff33] focus:border-transparent transition-all"
                    placeholder="billing@company.com"
                  />
                </div>
              </div>

              {emailError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
                  {emailError}
                </div>
              )}

              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={isSavingEmail}
                  className="inline-flex items-center justify-center gap-2 bg-[#d4ff33] text-black px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#c2eb2e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[8rem]"
                >
                  {isSavingEmail ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  ) : t('save')}
                </button>
                {emailSuccess && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 text-sm text-green-400">
                    <Check size={16} /> Saved
                  </motion.span>
                )}
              </div>
            </form>
          </div>
        </section>

        {/* Section 3: VAT Number */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">{t('vatNumber')}</h2>
            <button className="text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors">{t('close')}</button>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleSaveVat} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2" htmlFor="vatNumber">{t('vatNumber')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CreditCard className="h-5 w-5 text-zinc-500" />
                  </div>
                  <input
                    id="vatNumber"
                    type="text"
                    value={vatNumber}
                    onChange={(e) => setVatNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#d4ff33] focus:border-transparent transition-all"
                    placeholder="e.g. GB123456789"
                  />
                </div>
              </div>

              {vatError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
                  {vatError}
                </div>
              )}

              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={isSavingVat}
                  className="inline-flex items-center justify-center gap-2 bg-[#d4ff33] text-black px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#c2eb2e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[8rem]"
                >
                  {isSavingVat ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  ) : t('save')}
                </button>
                {vatSuccess && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 text-sm text-green-400">
                    <Check size={16} /> Saved
                  </motion.span>
                )}
              </div>
            </form>
          </div>
        </section>

      </div>
    </div>
  );
}
