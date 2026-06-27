export default function Footer() {
  return (
    <footer id="contact" className="border-t border-gray-800 bg-black py-10 text-gray-400">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between px-6 md:flex-row">
        <div>
          <h2 className="text-2xl font-bold text-white">Zerodoxa</h2>

          <p className="mt-2">Simplifying Every File.</p>
        </div>

        <nav aria-label="Footer navigation" className="mt-6 flex flex-wrap gap-6 md:mt-0">
          <a href="#home" className="transition hover:text-white">
            Home
          </a>

          <a href="#tools" className="transition hover:text-white">
            Tools
          </a>

          <a href="#features" className="transition hover:text-white">
            Features
          </a>

          <a href="#contact" className="transition hover:text-white">
            Contact
          </a>
        </nav>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Zerodoxa. All rights reserved.
      </div>
    </footer>
  );
}