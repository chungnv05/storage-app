import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import Icon from '../../components/common/Icon.jsx';

function UnauthorizedPage() {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleGoHome = () => {
        if (isAdmin) {
            navigate('/admin/dashboard');
        } else {
            navigate('/files');
        }
    };

    return (
        <div
            className="d-flex flex-column align-items-center justify-content-center min-vh-100 p-4 text-center"
            style={{
                background: 'radial-gradient(ellipse at top, #eef5ff 0%, #f6f8fb 70%)',
                minHeight: '100vh',
            }}
        >
            <style>{`
        @keyframes cloudFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .floating-cloud {
          animation: cloudFloat 4s ease-in-out infinite;
        }
      `}</style>

            {/* Đám mây bao quanh mã lỗi 403 Forbidden */}
            <div className="floating-cloud mb-4" style={{ maxWidth: '440px', width: '100%' }}>
                <svg
                    viewBox="0 0 450 380"
                    style={{
                        width: '100%',
                        height: 'auto',
                        filter: 'drop-shadow(0 20px 35px rgba(23, 101, 233, 0.12)) drop-shadow(0 4px 10px rgba(28, 45, 66, 0.05))',
                    }}
                >
                    <defs>
                        <linearGradient id="cloudGrad" x1="225" y1="80" x2="225" y2="330" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#ffffff" />
                            <stop offset="100%" stopColor="#f3f7fd" />
                        </linearGradient>
                        <linearGradient id="codeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#1c2d42" />
                            <stop offset="100%" stopColor="#1765e9" />
                        </linearGradient>
                    </defs>

                    {/* Đường nét hình đám mây */}
                    <path
                        d="M 126 324 h 198 a 72 72 0 0 0 0 -144 a 108 108 0 0 0 -198 -36 a 90 90 0 0 0 0 180 Z"
                        fill="url(#cloudGrad)"
                        stroke="#0f6be3ff"
                        strokeWidth="3.5"
                        strokeLinejoin="round"
                    />


                    {/* Mã lỗi 403 */}
                    <text
                        x="225"
                        y="232"
                        textAnchor="middle"
                        fill="url(#codeGrad)"
                        fontSize="70"
                        fontWeight="850"
                        fontFamily="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                        letterSpacing="-2"
                    >
                        403
                    </text>

                    {/* Chữ FORBIDDEN */}
                    <text
                        x="225"
                        y="265"
                        textAnchor="middle"
                        fill="#2882baff"
                        fontSize="14"
                        fontWeight="750"
                        fontFamily="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                        letterSpacing="4"
                    >
                        FORBIDDEN
                    </text>
                </svg>
            </div>
        </div>
    );
}

export default UnauthorizedPage;
