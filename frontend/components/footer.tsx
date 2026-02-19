/**
 * Footer Component - Global footer with links and legal notices
 */

'use client';

export function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center font-bold text-slate-300 text-xs">
              P0
            </div>
            <span className="font-bold text-slate-100">PanelZero</span>
          </div>
          <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
            The strict, role-based AI grading system for academic thesis defenses. Non-destructive DOCX
            editing powered by surgical XML injection.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-slate-100 mb-4">Architecture</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>
              <a href="#" className="hover:text-blue-400 transition-colors">
                Agent Routing
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-400 transition-colors">
                Supabase RLS
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-400 transition-colors">
                Security Protocols
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-slate-100 mb-4">Legal</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>
              <a href="#" className="hover:text-blue-400 transition-colors">
                Terms of Service
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-400 transition-colors">
                Zero Retention Policy
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-400 transition-colors">
                Academic Integrity
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-slate-800 text-sm text-slate-500 flex flex-col md:flex-row justify-between items-center">
        <p>© 2026 PanelZero Systems. All rights reserved.</p>
        <p className="mt-2 md:mt-0">Built for academic rigor.</p>
      </div>
    </footer>
  );
}
