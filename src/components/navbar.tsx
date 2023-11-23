import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';

const NavBar = () => {
    return (
        <nav className='flex justify-between items-center bg-[#004337] text-white p-2 shadow-lg fixed w-full z-10'>
            <div>
                <Link href='/' className='flex items-center gap-2'>
                    <img
                        src="/logo.jpeg"
                        alt='logo'
                        className='w-12 h-12 rounded-full'
                    />
                    <h1 className='font-bold text-lg'>Bet 24/7</h1>
                </Link>
            </div>
            <ConnectButton />
        </nav>
    )
}

export default NavBar