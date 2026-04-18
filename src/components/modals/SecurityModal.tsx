"use client";

import { useState } from "react";
import Link from "next/link";

const glass = {
  background: 'var(--glass-bg)',
  backdropFilter: 'blur(20px)',
  border: '1px solid var(--glass-border)',
  borderRadius: 20,
};

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SecurityModal({ isOpen, onClose }: SecurityModalProps) {
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [disableText, setDisableText] = useState('');

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          ...glass, padding: 0, width: '100%', maxWidth: 520,
          maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid var(--glass-border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'rgba(var(--primary-rgb), 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Security</h2>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 36, height: 36, borderRadius: 10, border: 'none',
              background: 'rgba(var(--primary-rgb), 0.08)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* 2FA Section */}
          <div style={{
            ...glass, padding: 24, marginBottom: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                background: 'rgba(var(--primary-rgb), 0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: '0 0 6px' }}>Two-Factor Authentication</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: 1.6 }}>
                  Add an extra layer of security to your account by requiring a verification code in addition to your password when signing in.
                </p>
                <button
                  onClick={() => setTwoFAEnabled(!twoFAEnabled)}
                  style={{
                    padding: '10px 24px', borderRadius: 12, border: 'none',
                    background: twoFAEnabled ? 'var(--success)' : 'var(--primary)',
                    color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 8,
                    transition: 'background 0.2s ease',
                  }}
                >
                  <div style={{
                    width: 36, height: 20, borderRadius: 10,
                    background: twoFAEnabled ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)',
                    position: 'relative', transition: 'all 0.3s ease',
                  }}>
                    <div style={{
                      width: 16, height: 16, borderRadius: '50%',
                      background: '#fff', position: 'absolute', top: 2,
                      left: twoFAEnabled ? 18 : 2,
                      transition: 'left 0.3s ease',
                    }} />
                  </div>
                  {twoFAEnabled ? 'Enabled' : 'Enable 2FA'}
                </button>
              </div>
            </div>
          </div>

          {/* Disable Account Section */}
          <div style={{
            ...glass, padding: 24,
            background: 'color-mix(in srgb, var(--danger) 5%, var(--glass-bg))',
            border: '1px solid color-mix(in srgb, var(--danger) 20%, var(--glass-border))',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                background: 'color-mix(in srgb, var(--danger) 15%, transparent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--danger)', margin: '0 0 6px' }}>Disable Account</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: 1.6 }}>
                  Disabling your account will immediately suspend all services including wallets, cards, and pending transactions. This action can be reversed by contacting support.
                </p>

                {!showDisableConfirm ? (
                  <button
                    onClick={() => setShowDisableConfirm(true)}
                    style={{
                      padding: '10px 24px', borderRadius: 12, border: 'none',
                      background: 'var(--danger)', color: '#fff',
                      fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      letterSpacing: 0.5,
                    }}
                  >
                    DISABLE ACCOUNT
                  </button>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <p style={{ fontSize: 13, color: 'var(--danger)', fontWeight: 600, margin: 0 }}>
                      Type "DISABLE" to confirm:
                    </p>
                    <input
                      type="text"
                      value={disableText}
                      onChange={e => setDisableText(e.target.value)}
                      placeholder='Type "DISABLE"'
                      style={{
                        padding: '10px 14px', borderRadius: 10,
                        border: '1px solid color-mix(in srgb, var(--danger) 30%, var(--glass-border))',
                        background: 'var(--surface)', color: 'var(--text)',
                        fontSize: 14, outline: 'none', fontFamily: 'var(--font-mono)',
                        letterSpacing: 2,
                      }}
                    />
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        disabled={disableText !== 'DISABLE'}
                        style={{
                          padding: '10px 20px', borderRadius: 10, border: 'none',
                          background: disableText === 'DISABLE' ? 'var(--danger)' : 'color-mix(in srgb, var(--danger) 30%, var(--surface))',
                          color: '#fff', fontSize: 13, fontWeight: 700, cursor: disableText === 'DISABLE' ? 'pointer' : 'not-allowed',
                          opacity: disableText === 'DISABLE' ? 1 : 0.5,
                        }}
                      >
                        Confirm Disable
                      </button>
                      <button
                        onClick={() => { setShowDisableConfirm(false); setDisableText(''); }}
                        style={{
                          padding: '10px 20px', borderRadius: 10,
                          border: '1px solid var(--glass-border)',
                          background: 'var(--surface)', color: 'var(--text)',
                          fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
