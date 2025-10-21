// CategoryInfoModal.js
import { X } from 'lucide-react';

import AboveTheFoldContainer from '../descriptions/aboveTheFold';
import BeneathTitleContainer from '../descriptions/beneathTitle';
import BottomContainer from '../descriptions/bottom';
import FloatingContainer from '../descriptions/floating';
import HeaderPicContainer from '../descriptions/header';
import InFeedContainer from '../descriptions/inFeed';
import InlineContentContainer from '../descriptions/inlineContent';
import LeftRailContainer from '../descriptions/leftRail';
import MobileInterstialContainer from '../descriptions/mobileInterstial';
import ModalPicContainer from '../descriptions/modal';
import OverlayContainer from '../descriptions/overlay';
import ProFooterContainer from '../descriptions/proFooter';
import RightRailContainer from '../descriptions/rightRail';
import SidebarContainer from '../descriptions/sidebar';
import StickySidebarContainer from '../descriptions/stickySidebar';

const CategoryInfoModal = ({ isOpen, onClose, category }) => {
    if (!isOpen) return null;
    // Create a normalized mapping that handles different case variations
    const CategoryComponents = {
        'aboveTheFold': AboveTheFoldContainer,
        'beneathTitle': BeneathTitleContainer,
        'bottom': BottomContainer,
        'floating': FloatingContainer,
        'HeaderPic': HeaderPicContainer,
        'headerPic': HeaderPicContainer, // Add alternative case
        'inFeed': InFeedContainer,
        'infeed': InFeedContainer, // Add alternative case
        'inlineContent': InlineContentContainer,
        'leftRail': LeftRailContainer,
        'mobileInterstial': MobileInterstialContainer,
        'modalPic': ModalPicContainer,
        'overlay': OverlayContainer,
        'proFooter': ProFooterContainer,
        'rightRail': RightRailContainer,
        'sidebar': SidebarContainer,
        'stickySidebar': StickySidebarContainer
    };

    const CategoryComponent = CategoryComponents[category];

    return (
        <div className="fixed inset-0 backdrop-blur-lg bg-black/60 flex items-center justify-center z-50 overflow-y-auto">
            <div className="relative w-full h-full max-w-7xl mx-auto">
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 z-50 p-3 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 text-white/80 hover:text-white hover:bg-white/20 transition-all duration-300"
                >
                    <X className="w-6 h-6" />
                </button>
                {CategoryComponent && <CategoryComponent />}
            </div>
        </div>
    );
};

export default CategoryInfoModal;