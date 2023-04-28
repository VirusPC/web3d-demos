
"use client"
import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import Logo from "../logo";

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Gallery', href: '/gallery' },
  { name: 'References', href: '/references' }
]
const githubHref = "https://github.com/VirusPC/web3d-demos";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  return (
  <header className="absolute inset-x-0 top-0 z-50 border-b-2">
    <nav className="flex justify-between items-center p-4 lg:px-6" aria-label="Global">
      <div className="flex lg:flex-1">
        <Logo/>
      </div>
      <div className="flex lg:hidden">
        <button
          type="button"
          className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
          onClick={() => setMobileMenuOpen(true)}
        >
          <span className="sr-only">Open main menu</span>
          <Bars3Icon className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
      <div className="hidden lg:flex lg:gap-x-12">
        {navigation.map((item) => (
          <Link key={item.name} href={item.href} className="text-sm font-semibold leading-6 text-gray-900 hover:text-indigo-500">
            {item.name}
          </Link>
        ))}
      </div>
      <div className="hidden lg:flex lg:flex-1 lg:justify-end">
        <Link href={githubHref} target='_blank' className="text-gray-900">
          <span className="text-3xl iconfont icon-github"></span>
        </Link>
        {/* </a> */}
      </div>
    </nav>
    <Dialog as="div" className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
      <div className="fixed inset-0 z-50" />
      <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
        <div className="flex items-center justify-between border-b-2 pb-3">
          <Logo/>
          <button
            type="button"
            className="-m-2.5 rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="sr-only">Close menu</span>
            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-3 flow-root">
          <div className="-my-6 divide-y divide-gray-500/10">
            <div className="space-y-2 py-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="py-6">
                  <Link
                    href={githubHref}
                    className="-mx-3 block rounded-lg px-3 py-1 text-base font-semibold text-gray-900 hover:bg-gray-50"
                  >
                    Github
                  </Link>
                </div>
          </div>
        </div>
      </Dialog.Panel>
    </Dialog>
  </header>
  )
}