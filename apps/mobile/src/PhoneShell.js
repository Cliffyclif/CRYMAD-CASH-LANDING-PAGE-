import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Pure iPhone 14 Pro chrome — notch, rounded corners, shadow.
 * All status bars, tab bars, headers live inside the stitch HTML content.
 */
export function PhoneShell({ children }) {
    return (_jsxs("div", { className: "phone-shell", children: [_jsx("div", { className: "phone-notch" }), _jsx("div", { className: "phone-viewport", children: children })] }));
}
