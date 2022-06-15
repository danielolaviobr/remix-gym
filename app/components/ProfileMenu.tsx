import { Menu, Transition } from "@headlessui/react";
import { Fragment, useEffect, useRef, useState } from "react";
import { PlusIcon, AdjustmentsIcon } from "@heroicons/react/solid";
import { LogoutIcon } from "@heroicons/react/outline";

export default function ProfileMenu() {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="rounded-full outline-blue-600">
          <img
            src="https://lh3.googleusercontent.com/QKb-F3idM48ZXt6pN_gUBP96U5_5x6aoEts1QQkvb5bvwLxKyGyMpztQEqSnNfBouI9D_lRtq50ilUL5OZdjMUVh5yug_VRH-ZCo9MhRVxqdldTMEDMiXxQr-Ckj0NMsGzkNLZi8n7_PV3IFgAnkQkDOCNJQxJO6oxHl2GPaN8vvj-yj6nBCxRGpJUpymF0lg4iz5KsM7ueXldgPxEZrKsJ_JBgxzSbwL_YB71VYF6eCf9JAsFNkYCgZTNpwFUOX8EV4nYXbqG5j0vpSp4tuA_57neL_VIQf5Ag0m0vDKHCako0sbbL0gsypXghuJNlOASUaTczhbnASOArHRf3du1LTBiroNwxCOVi_oQ74N1w0MJftyJcVqNxXy5Iyt8uF-GOnNXFlFgvuCR3mI4b6_irKhsqdf6bxU6cFuqnM3E4j-ZAKATOWaRDZutC9jqh_W5C-RYEVTFRjhHS8k2p9kw4oSDGiR4w8xj7dU0YV6obVHJAoj1yaNS6Et_yoMJP_Rlq6IUug6Uh2-Ym9k9d_IZwzH29-raRdgWY660tUd9I-oE6CN3wPT_VLEXmYqOpZu-mkjZPdjK_bG9T_V3UJQdBehmYd2ksh1qMj9HpQj1PSAM4wXVeqZ5e1yYWvHFMlBME4k2ztYryDHg_y3I2opvQyg2IR-7Btm3bU5-OYvSgwz8ZP8vyTf-W6_XY4-O7YcaoOFwxvYhX4eJvsdK0VZnqIYo-6zXMZNS6pMD-Iuo02e1Sos2LgO-l6lfFR=w1152-h2048-no?authuser=0"
            alt="Daniel"
            className="h-12 w-12 rounded-full object-cover"
          />
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-64 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-1 py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${
                    active ? "bg-blue-500 text-white" : "text-gray-900"
                  } group flex w-full items-center rounded-md px-2 py-2`}
                >
                  <PlusIcon
                    className={`mr-2 h-6 w-6 ${
                      active ? "text-white" : "text-blue-400"
                    }`}
                    aria-hidden="true"
                  />
                  Criar série
                </button>
              )}
            </Menu.Item>
          </div>
          <div className="px-1 py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${
                    active ? "bg-blue-500 text-white" : "text-gray-900"
                  } group flex w-full items-center rounded-md px-2 py-2`}
                >
                  <AdjustmentsIcon
                    className={`mr-2 h-6 w-6 ${
                      active ? "text-white" : "text-blue-400"
                    }`}
                    aria-hidden="true"
                  />
                  Configurações
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${
                    active ? "bg-blue-500 text-white" : "text-gray-900"
                  } group flex w-full items-center rounded-md px-2 py-2`}
                >
                  <LogoutIcon
                    className={`mr-2 h-6 w-6 ${
                      active ? "text-white" : "text-blue-400"
                    }`}
                    aria-hidden="true"
                  />
                  Sait
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
