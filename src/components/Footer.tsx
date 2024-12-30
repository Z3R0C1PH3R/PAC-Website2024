import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Github, Instagram, Mail, MapPin, Phone, Globe } from 'lucide-react';
import Logo from '/PAC_logo_circle.svg';

export function Footer() {
  const [isOpen, setIsOpen] = useState(false);

  const footerSections = [
    {
      title: 'Quick Links',
      links: [
        { name: 'PAC Times', path: '/pac-times' },
        { name: 'Our Team', path: '#team' },
        { name: 'Admin', path: '/admin' },
      ]
    },
    {
      title: 'Resources',
      links: [
        { name: 'Research Papers', path: '#research' },
        { name: 'Photo Gallery', path: '#gallery' },
        { name: 'Blog', path: '#blog' },
      ]
    }
  ];

  const socialLinks = [
    { icon: <Github className="h-5 w-5" />, href: 'https://github.com/pac-iitd', label: 'GitHub' },
    { icon: <Instagram className="h-5 w-5" />, href: 'https://instagram.com/pac_iitd', label: 'Instagram' },
    { icon: <Mail className="h-5 w-5" />, href: 'mailto:pac@iitd.ac.in', label: 'Email' },
  ];

  return (
    <footer className="bg-slate-800/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Footer Content */}
        <div className="flex flex-col lg:flex-row justify-between space-y-8 lg:space-y-0">
          {/* Logo and About Section */}
          <div className="flex flex-col space-y-4 max-w-sm">
            <Link to="/" className="flex items-center space-x-2">
              <img src={Logo} alt="PAC Logo" className="h-10 w-10 object-contain" />
            </Link>
            <p className="text-gray-400 text-sm">
              The Physics and Astronomy Club at IIT Delhi is a community of space enthusiasts, 
              researchers, and curious minds exploring the mysteries of the universe together.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-purple-400 transition-colors"
                  aria-label={link.label}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Sections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Quick Links and Resources */}
            {footerSections.map((section) => (
              <div key={section.title}>
                <h3 className="text-gray-300 font-semibold mb-4">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.path}
                        className="text-gray-400 hover:text-purple-400 transition-colors text-sm"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Contact Information */}
            <div>
              <h3 className="text-gray-300 font-semibold mb-4">Contact Us</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-purple-400 mt-1" />
                  <p className="text-gray-400 text-sm">
                    WS120, Physics and Astronomy<br />
                    Club, Central Workshop, IIT Delhi,<br />
                    Hauz Khas, Delhi, 110016
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-purple-400" />
                  <a 
                    href="mailto:pac@iitd.ac.in" 
                    className="text-gray-400 hover:text-purple-400 transition-colors text-sm"
                  >
                    pac@iitd.ac.in
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>© {new Date().getFullYear()} Physics and Astronomy Club, IIT Delhi. All rights reserved.</p>
            <div className="mt-4 md:mt-0 space-x-6">
              <Link to="#privacy" className="hover:text-purple-400 transition-colors">
                Privacy Policy
              </Link>
              <Link to="#terms" className="hover:text-purple-400 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;