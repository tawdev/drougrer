
export default function OrderConfirmationPage() {
  return (
    <>
      <div className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 flex flex-col" style={{ '--primary': '#ee8c2b', '--background-light': '#f8f7f6', '--background-dark': '#221910', '--brand-navy': '#1e293b', '--radius': '0.25rem', '--radius-lg': '0.5rem', '--radius-xl': '0.75rem', '--radius-full': '9999px', '--font-display': 'Inter,sans-serif' } as React.CSSProperties}>

        <div className="layout-container flex h-full grow flex-col">

          <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-primary/10 bg-white dark:bg-slate-900 px-6 md:px-20 lg:px-40 py-4">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 text-brand-navy dark:text-primary">
                <span className="material-symbols-outlined text-3xl">medical_services</span>
                <h2 className="text-xl font-bold leading-tight tracking-tight">Droguerie</h2>
              </div>
              <nav className="hidden md:flex items-center gap-8">
                <a className="text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-primary transition-colors" href="#">Health</a>
                <a className="text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-primary transition-colors" href="#">Beauty</a>
                <a className="text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-primary transition-colors" href="#">Wellness</a>
                <a className="text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-primary transition-colors" href="#">Pharmacy</a>
              </nav>
            </div>
            <div className="flex flex-1 justify-end gap-4">
              <label className="hidden sm:flex flex-col min-w-40 h-10 max-w-64">
                <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                  <div className="text-slate-400 flex border-none bg-slate-100 dark:bg-slate-800 items-center justify-center pl-4 rounded-l-lg" data-icon="search">
                    <span className="material-symbols-outlined text-xl">search</span>
                  </div>
                  <input className="form-input flex w-full min-w-0 flex-1 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-0 focus:ring-0 border-none bg-slate-100 dark:bg-slate-800 h-full placeholder:text-slate-400 px-4 rounded-l-none pl-2 text-sm font-normal" placeholder="Search products..." />
                </div>
              </label>
              <div className="flex gap-2">
                <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-primary/20 transition-colors">
                  <span className="material-symbols-outlined text-xl">shopping_cart</span>
                </button>
                <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-primary/20 transition-colors">
                  <span className="material-symbols-outlined text-xl">person</span>
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
            <div className="max-w-[720px] w-full text-center space-y-8">

              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mb-2 shadow-sm">
                  <span className="material-symbols-outlined text-5xl">check_circle</span>
                </div>
                <h1 className="text-brand-navy dark:text-slate-100 text-3xl md:text-4xl font-bold leading-tight">Your order has been successfully placed</h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">Order Number: #782910</p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl shadow-primary/5 border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                  <h3 className="text-brand-navy dark:text-slate-100 font-bold text-lg">Order Summary</h3>
                  <span className="text-sm text-slate-500 dark:text-slate-400">Placed on Oct 24, 2023</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                        <th className="px-6 py-4 font-semibold">Item</th>
                        <th className="px-6 py-4 font-semibold text-center">Quantity</th>
                        <th className="px-6 py-4 font-semibold text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      <tr>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-slate-900 dark:text-slate-100 font-medium">Vitamin C Serum</span>
                            <span className="text-xs text-slate-400">Skin Radiance Series</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-400">1</td>
                        <td className="px-6 py-4 text-right text-slate-900 dark:text-slate-100 font-medium">$24.99</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-slate-900 dark:text-slate-100 font-medium">Eucalyptus Essential Oil</span>
                            <span className="text-xs text-slate-400">Pure Organic Extract</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-400">2</td>
                        <td className="px-6 py-4 text-right text-slate-900 dark:text-slate-100 font-medium">$31.00</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-slate-900 dark:text-slate-100 font-medium">Organic Hand Cream</span>
                            <span className="text-xs text-slate-400">Shea Butter &amp; Lavender</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-400">1</td>
                        <td className="px-6 py-4 text-right text-slate-900 dark:text-slate-100 font-medium">$12.00</td>
                      </tr>
                    </tbody>
                    <tfoot className="bg-slate-50 dark:bg-slate-800/30">
                      <tr>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-medium" colSpan={2}>Subtotal</td>
                        <td className="px-6 py-4 text-right text-slate-900 dark:text-slate-100">$67.99</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-medium border-t border-slate-100 dark:border-slate-800" colSpan={2}>Shipping</td>
                        <td className="px-6 py-4 text-right text-green-600 dark:text-green-400 border-t border-slate-100 dark:border-slate-800 font-medium">FREE</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-6 text-brand-navy dark:text-slate-100 text-xl font-bold" colSpan={2}>Total</td>
                        <td className="px-6 py-6 text-right text-primary text-2xl font-bold">$67.99</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="flex flex-col items-center gap-6 pt-4">
                <button className="bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
                  Continue Shopping
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
                <p className="text-slate-400 text-sm max-w-md">
                  A confirmation email has been sent to your registered address. You can track your shipment details in your account dashboard.
                </p>
              </div>
            </div>
          </main>

        </div>
      </div>
    </>
  );
}


