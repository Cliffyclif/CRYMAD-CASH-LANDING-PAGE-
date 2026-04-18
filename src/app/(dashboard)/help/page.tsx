"use client";

import { useState } from "react";
import Link from "next/link";

const glass = {
  background: 'var(--glass-bg)',
  backdropFilter: 'blur(20px)',
  border: '1px solid var(--glass-border)',
  borderRadius: 20,
};

type Category = 'GENERAL' | 'E-WALLET' | 'BANKING' | 'CRYPTO' | 'CARDS';

const CATEGORIES: Category[] = ['GENERAL', 'E-WALLET', 'BANKING', 'CRYPTO', 'CARDS'];

const FAQ_DATA: Record<Category, { q: string; a: string }[]> = {
  GENERAL: [
    { q: 'What types of wallets are available?', a: 'Crymad Cash offers four wallet types: E-Wallet for fiat currency operations and commission payouts, Crypto Wallet for managing digital assets like BTC, ETH, USDT, and more, Card Wallet for loading funds onto your virtual or physical cards, and Rewards Wallet for bonus earnings and promotional credits.' },
    { q: 'Can I use multiple wallets at once?', a: 'Yes, all wallets operate independently and simultaneously. You can hold balances across your E-Wallet, Crypto Wallet, Card Wallet, and Rewards Wallet at the same time. Each wallet has its own set of features and you can transfer funds between them as needed.' },
    { q: 'How do I view my wallet balances?', a: 'Your Dashboard displays all wallet balances at a glance through the wallet capsules at the top of the page. Each capsule shows the current balance for that wallet type. You can click any capsule to navigate to that wallet\'s detailed view for more information.' },
    { q: 'What currencies are supported?', a: 'For fiat currencies, we support USD, EUR, JPY, and CAD. For cryptocurrencies, we support major tokens including BTC, ETH, USDT, USDC, SOL, and BNB across multiple blockchain networks including Ethereum, Tron, BSC, Solana, and Polygon.' },
    { q: 'How does the Wallet System work?', a: 'Funds flow through a structured system: deposits and incoming payments arrive in your E-Wallet or Crypto Wallet depending on the source. From there, you can transfer funds internally between wallets, load your card wallet for spending, swap between crypto tokens, or withdraw to external bank accounts or crypto addresses.' },
    { q: 'Is my data secure?', a: 'Absolutely. We employ AES-256 encryption for all data at rest, two-factor authentication (2FA) for account access, real-time fraud monitoring, and regular security audits. All API communications are secured with TLS 1.3, and we never store sensitive card details on our servers.' },
  ],
  'E-WALLET': [
    { q: 'How to transfer funds internally?', a: 'Navigate to the E-Wallet page and select "Internal Transfer". Choose the destination wallet (Crypto, Card, or another user\'s E-Wallet), enter the amount, and confirm. Internal transfers between your own wallets are instant and free of charge.' },
    { q: 'What are withdrawal limits?', a: 'Standard account withdrawal limits are $10,000 daily and $50,000 monthly. These limits apply across all withdrawal methods combined. Premium account holders may have higher limits. You can view your current limits and usage on the E-Wallet settings page.' },
    { q: 'How long do bank withdrawals take?', a: 'Bank withdrawals typically take 1-3 business days depending on your bank and region. Withdrawals initiated before 2PM UTC on business days are usually processed same day. Weekend and holiday withdrawals are processed on the next business day.' },
    { q: 'Can I withdraw to crypto?', a: 'Yes, you can convert your E-Wallet balance to crypto and withdraw. Select the token you want to receive (e.g., USDT, USDC, BTC), choose the network (Ethereum, Tron, BSC, etc.), enter the destination address, and confirm. Conversion rates are shown before confirmation.' },
    { q: 'What fees apply?', a: 'Fee structure varies by operation: Internal transfers between your own wallets are free. Bank withdrawals incur a flat fee of $2.50. Crypto withdrawals include a network fee that varies by blockchain. Card loading has a 1% fee. See the full fee schedule in Settings for detailed pricing.' },
    { q: 'How do beneficiaries work?', a: 'Beneficiaries let you save bank account details for quick withdrawals. Add a beneficiary by going to E-Wallet > Beneficiaries, entering the bank name, account number, and account holder name. Once saved, you can select them during withdrawals without re-entering details.' },
  ],
  BANKING: [
    { q: 'How to open a banking account?', a: 'Navigate to the Banking section from the main navigation. You\'ll need an active subscription to access banking features. Click "Subscribe" to set up your banking portal, which gives you access to full banking capabilities including payable, receivable, and treasury management.' },
    { q: 'What are the monthly fees?', a: 'The banking portal subscription costs $4.95 per month with a one-time setup fee of $9.00. This gives you full access to all banking features including payable management, receivable tracking, treasury operations, and remittance services. You can cancel anytime.' },
    { q: 'What banking features are available?', a: 'Our banking suite includes: Payable management for outgoing payments and bills, Receivable tracking for incoming payments and invoices, Treasury management for cash flow optimization, Remittance services for cross-border transfers, and detailed reporting and analytics for all banking operations.' },
    { q: 'Can I cancel my subscription?', a: 'Yes, you can cancel your banking subscription at any time from the Banking settings page. Cancellation takes effect at the end of your current billing cycle. Your banking data will be retained for 90 days after cancellation in case you decide to re-subscribe.' },
    { q: 'Is there a minimum balance?', a: 'No, there is no minimum balance requirement for the banking portal. You can use all features regardless of your account balance. However, certain operations like outgoing payments require sufficient funds in your E-Wallet to complete the transaction.' },
    { q: 'How do remittances work?', a: 'Remittances enable cross-border transfers to bank accounts worldwide. Select the destination country, enter the recipient\'s bank details, specify the amount and currency, and confirm. Transfer times vary by corridor (typically 1-5 business days). Competitive exchange rates are displayed before confirmation.' },
  ],
  CRYPTO: [
    { q: 'What tokens are supported?', a: 'We currently support six major cryptocurrencies: Bitcoin (BTC), Ethereum (ETH), Tether (USDT), USD Coin (USDC), Solana (SOL), and Binance Coin (BNB). We regularly evaluate new tokens for addition based on market demand and security assessments.' },
    { q: 'How to deposit crypto?', a: 'Go to the Crypto page and click "Deposit". Select the token you want to deposit and choose the network (e.g., ERC-20 for Ethereum, TRC-20 for Tron). A unique deposit address will be generated. Send your crypto to this address. Deposits are credited after the required number of network confirmations.' },
    { q: 'What are swap fees?', a: 'Swap fees are variable and depend on the token pair, market conditions, and swap amount. The exact fee is always displayed on the confirmation screen before you execute the swap. Typical fees range from 0.1% to 0.5% of the swap amount. There are no hidden charges.' },
    { q: 'How long do withdrawals take?', a: 'Crypto withdrawal times depend on the blockchain network and current congestion: Bitcoin typically takes 10-60 minutes, Ethereum 2-15 minutes, Tron 1-5 minutes, BSC 1-5 minutes, and Solana under 1 minute. All withdrawals require our security team\'s approval for amounts over $5,000.' },
    { q: 'Can I buy crypto with fiat?', a: 'Yes, you can buy crypto directly using your E-Wallet balance. Go to Crypto > Buy, select the token you want to purchase, enter the fiat amount or token quantity, review the exchange rate and fees, then confirm. The purchased tokens are credited to your Crypto Wallet instantly.' },
    { q: 'What networks are supported?', a: 'We support six blockchain networks: Ethereum (ERC-20) for ETH, USDT, and USDC; Tron (TRC-20) for USDT and USDC; Binance Smart Chain (BEP-20) for BNB and USDT; Solana (SPL) for SOL and USDC; Polygon (ERC-20) for USDT and USDC; and Bitcoin mainnet for BTC.' },
  ],
  CARDS: [
    { q: 'Virtual vs Physical card?', a: 'Virtual cards are generated instantly and exist only in digital form — perfect for online payments, subscriptions, and digital wallets. Physical cards are manufactured and delivered to your address within 7-14 business days and can be used at ATMs and point-of-sale terminals worldwide.' },
    { q: 'How to order a card?', a: 'Navigate to Cards > Order New Card. Choose between Virtual or Physical card type. For virtual cards, the card is generated instantly. For physical cards, enter your shipping address and select your preferred delivery option. Card fees will be deducted from your E-Wallet balance.' },
    { q: 'What are card limits?', a: 'Standard card limits are: Daily spending limit of $5,000, Monthly spending limit of $25,000, Daily ATM withdrawal limit of $1,000 (physical cards only), and single transaction limit of $3,000. Premium cards have higher limits. You can view and request limit changes from the Cards page.' },
    { q: 'How to load funds onto card?', a: 'Go to Cards, select your card, and tap "Load Funds". You can load from your E-Wallet balance or Crypto Wallet. Enter the amount to load, review any applicable fees (1% loading fee), and confirm. Funds are available on your card instantly after loading.' },
    { q: 'Can I lock my card?', a: 'Yes, you can instantly lock and unlock your card from the Cards page. Tap the lock icon on your card to toggle the lock status. When locked, all transactions will be declined. This is useful if you misplace your card or suspect unauthorized use. Unlocking is equally instant.' },
    { q: 'How to view card details?', a: 'For security purposes, viewing full card details (card number, CVV, expiry) requires OTP verification. Go to Cards, select your card, and tap "View Details". Enter the OTP sent to your registered phone number. Card details will be displayed for 30 seconds before automatically hiding.' },
  ],
};

export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('GENERAL');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = FAQ_DATA[activeCategory];

  const filteredFaqs = searchQuery.trim()
    ? Object.values(FAQ_DATA).flat().filter(
        f => f.q.toLowerCase().includes(searchQuery.toLowerCase()) || f.a.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header */}
      <div style={{ textAlign: 'center', padding: '20px 0 0' }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)', margin: 0 }}>
          Hello, how can we{' '}
          <span style={{
            background: 'linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 60%, #fff))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>help you</span>?
        </h1>
      </div>

      {/* Search Bar */}
      <div style={{ maxWidth: 600, margin: '0 auto', width: '100%' }}>
        <div style={{
          ...glass, padding: '4px 4px 4px 20px',
          display: 'flex', alignItems: 'center', gap: 12,
          borderRadius: 16,
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search for answers..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setExpandedIndex(null); }}
            style={{
              flex: 1, border: 'none', background: 'transparent',
              color: 'var(--text)', fontSize: 15, outline: 'none',
              padding: '14px 0',
            }}
          />
        </div>
      </div>

      {/* Category Tabs */}
      {!searchQuery.trim() && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setExpandedIndex(null); }}
              style={{
                padding: '10px 22px', borderRadius: 30,
                border: activeCategory === cat ? 'none' : '1px solid var(--glass-border)',
                background: activeCategory === cat ? 'var(--primary)' : 'var(--glass-bg)',
                backdropFilter: 'blur(20px)',
                color: activeCategory === cat ? '#fff' : 'var(--text-secondary)',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                letterSpacing: 0.8, transition: 'all 0.2s ease',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* FAQ Accordion */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filteredFaqs.map((faq, i) => {
          const isOpen = expandedIndex === i;
          return (
            <div key={i} style={{ ...glass, overflow: 'hidden' }}>
              <button
                onClick={() => setExpandedIndex(isOpen ? null : i)}
                style={{
                  width: '100%', padding: '18px 22px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  gap: 16,
                }}
              >
                <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', textAlign: 'left' }}>{faq.q}</span>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: 'rgba(var(--primary-rgb), 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease',
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
              </button>
              <div style={{
                maxHeight: isOpen ? 300 : 0,
                overflow: 'hidden',
                transition: 'max-height 0.35s ease',
              }}>
                <div style={{
                  padding: '0 22px 20px',
                  fontSize: 14, lineHeight: 1.8, color: 'var(--text-secondary)',
                }}>
                  {faq.a}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Still Need Help */}
      <div style={{
        ...glass, padding: 32, textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'rgba(var(--primary-rgb), 0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Still need help?</h3>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0, maxWidth: 400 }}>
          Contact our support team and we will get back to you within 24 hours.
        </p>
        <a
          href="mailto:support@crymadcash.com"
          style={{
            padding: '12px 28px', borderRadius: 14,
            background: 'var(--primary)', color: '#fff',
            fontSize: 14, fontWeight: 700, textDecoration: 'none',
            display: 'inline-block', marginTop: 4,
          }}
        >
          support@crymadcash.com
        </a>
      </div>
    </div>
  );
}
