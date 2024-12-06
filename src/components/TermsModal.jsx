import React from 'react';
// Remove unused X import if not needed
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog.jsx";

const TermsModal = () => {
  return (
    <div className="w-full text-center text-sm text-gray-500 mt-8">
      <Dialog>
        <DialogTrigger className="hover:text-gray-800 hover:underline">
          Terms & Conditions
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Terms & Conditions</DialogTitle>
          </DialogHeader>
          
          <div className="text-sm text-gray-600 space-y-4">
            {/* Rest of your terms content */}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TermsModal;
