
export default function CheckoutPage() {
  return (
    <>
      <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased" style={{ '--primary': '#1152d4', '--accent': '#f97316', '--background-light': '#f6f6f8', '--background-dark': '#101622', '--radius': '0.25rem', '--radius-lg': '0.5rem', '--radius-xl': '0.75rem', '--radius-full': '9999px', '--font-display': 'Inter' } as React.CSSProperties}>

        <div className="relative flex w-full flex-col">

          <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col px-6 py-8 lg:px-10 lg:py-12">
            <div className="mb-8">
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50 lg:text-4xl">Checkout</h1>
              <p className="mt-2 text-slate-600 dark:text-slate-400">Please provide your details to complete the purchase.</p>
            </div>
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">

              <div className="lg:col-span-7">
                <section className="space-y-8">
                  <div>
                    <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-slate-50 mb-6">
                      <span className="material-symbols-outlined text-primary">person</span>
                      Customer Information
                    </h3>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <label className="flex flex-col gap-2 md:col-span-2">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</span>
                        <input className="rounded-lg border-slate-200 bg-white p-3.5 text-slate-900 focus:border-primary focus:ring-primary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100" placeholder="John Doe" type="text" />
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Phone Number</span>
                        <input className="rounded-lg border-slate-200 bg-white p-3.5 text-slate-900 focus:border-primary focus:ring-primary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100" placeholder="+1 234 567 890" type="tel" />
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</span>
                        <input className="rounded-lg border-slate-200 bg-white p-3.5 text-slate-900 focus:border-primary focus:ring-primary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100" placeholder="john@example.com" type="email" />
                      </label>
                    </div>
                  </div>
                  <div>
                    <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-slate-50 mb-6">
                      <span className="material-symbols-outlined text-primary">local_shipping</span>
                      Delivery Details
                    </h3>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <label className="flex flex-col gap-2 md:col-span-2">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Delivery Address</span>
                        <input className="rounded-lg border-slate-200 bg-white p-3.5 text-slate-900 focus:border-primary focus:ring-primary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100" placeholder="Street address, apartment, suite" type="text" />
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">City</span>
                        <input className="rounded-lg border-slate-200 bg-white p-3.5 text-slate-900 focus:border-primary focus:ring-primary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100" placeholder="City" type="text" />
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Postal Code</span>
                        <input className="rounded-lg border-slate-200 bg-white p-3.5 text-slate-900 focus:border-primary focus:ring-primary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100" placeholder="12345" type="text" />
                      </label>
                      <label className="flex flex-col gap-2 md:col-span-2">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Order Notes (Optional)</span>
                        <textarea className="rounded-lg border-slate-200 bg-white p-3.5 text-slate-900 focus:border-primary focus:ring-primary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100" placeholder="Special instructions for delivery" rows={3}></textarea>
                      </label>
                    </div>
                  </div>
                  <div className="pt-4">
                    <button className="w-full rounded-xl bg-accent px-8 py-5 text-lg font-bold text-white shadow-lg transition-all hover:bg-orange-600 hover:shadow-xl active:scale-[0.98] lg:w-auto">
                      Confirm Order
                    </button>
                    <p className="mt-4 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
                      <span className="material-symbols-outlined text-sm">lock</span>
                      Your payment information is encrypted and secure.
                    </p>
                  </div>
                </section>
              </div>

              <div className="lg:col-span-5">
                <div className="sticky top-8 rounded-2xl bg-slate-100/80 p-6 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
                  <h3 className="mb-6 text-xl font-bold text-slate-900 dark:text-slate-50">Order Summary</h3>
                  <div className="mb-8 space-y-4 max-h-[400px] overflow-y-auto pr-2">

                    <div className="flex items-center gap-4">
                      <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                        <img className="h-full w-full object-cover" data-alt="Eco friendly cleaning spray bottle" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbMruHYagCW56J7KKF3t11fwR_I_-RTWMvaYGqYTxnc16E5SVF6mRnDLt_AgBACgi-I-ZFZNlhz-EdP8Z7aodtUg2kNIn7-zlv7UvrUYX4LuZzH56SuKTmTExYZy3zBYhuXmGTv8U8phzb7pItT06DoAs-EKvWks0v8kWJXvEeWY0tLyaEKpCS5A3RLvgUtXU4_Vy4L4fh6v-fhCMzZWXl2-MtEITv0tT-bMHfa6Y4a6YFnK9fur8Vv0_c7dhtTWkyjxgjomzbIY8" />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <span className="font-semibold text-slate-900 dark:text-slate-50">Natural Multi-Surface Cleaner</span>
                        <span className="text-sm text-slate-500">Qty: 2</span>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-slate-50">$18.00</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                        <img className="h-full w-full object-cover" data-alt="Traditional wood polishing wax container" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQMGWmPRcN5ryRCAdeD2PdjVeWSMqOHJ6d1DyHxPhkk0O-vMxbj_dGPWvxhjbqha7F0Yfy4Wj2bPs2bmEHg4E2iLpsWjUAoBXlIMhH2ed2dknSXoHkIqVq5KubrsFxvC4FJgCfFtdaxNLUU57TlQ8CZMsEjcQqIGL5tQ7ibL5nxx0nfXjy9E7Aw3MpRKuHP8WIaHtZKYOzeMJoG7_7t9UyTEj7R0DKdJI82ODkzCWlNkCoytMRHjmfldNMCP0KX0EojeEFEaqKcLc" />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <span className="font-semibold text-slate-900 dark:text-slate-50">Beeswax Furniture Polish</span>
                        <span className="text-sm text-slate-500">Qty: 1</span>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-slate-50">$12.50</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                        <img className="h-full w-full object-cover" data-alt="Set of natural fiber scrubbing brushes" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfuRJstDCWjGSzjKueG2Dk9qNAVf3aWD3SRjbFaqnG_Dlwv9R77t-FePsEs6s44e3iChboaua9-WWEAHm0PD7O1tdx8Z8tyqgddB9moE8JVzOobJNUaghuNr-bb1ZnIrsXsF-7ol6PjNcxgH3WfH2TaPsZD_vqUnZN0oLBRHCAYIKvJ-Vudn0S5HWOaorOYBKHOafS4AGEPd4ipxDlmxzaUx9zR4bjUSDXVLj544n-YK1LpdHguGFINuoLUk-8hgrHoppM5tzOiSA" />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <span className="font-semibold text-slate-900 dark:text-slate-50">Sisal Fiber Scrub Brush Set</span>
                        <span className="text-sm text-slate-500">Qty: 1</span>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-slate-50">$15.00</span>
                    </div>
                  </div>
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-6 space-y-3">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Subtotal</span>
                      <span>$45.50</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Shipping</span>
                      <span className="text-green-600 font-medium">Free</span>
                    </div>
                    <div className="flex justify-between pt-3 text-xl font-extrabold text-primary">
                      <span>Total Price</span>
                      <span>$45.50</span>
                    </div>
                  </div>
                  <div className="mt-8 rounded-lg bg-primary/10 p-4 border border-primary/20">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary">local_offer</span>
                      <div>
                        <p className="text-sm font-bold text-primary">Promo code applied</p>
                        <p className="text-xs text-primary/80 italic">"WELCOME10" - You saved $5.00</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>

        </div>
      </div>
    </>
  );
}


