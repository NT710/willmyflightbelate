import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

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
            <p className="font-medium text-gray-800">
              By using this flight delay prediction service, you acknowledge and agree to the following terms:
            </p>
            
            <div className="space-y-2">
              <p>
                1. This service provides estimates and predictions based on publicly available data sources.
                All predictions are probabilistic in nature and should not be considered guarantees.
              </p>
              
              <p>
                2. The accuracy of predictions depends on multiple factors including weather conditions,
                air traffic, airline operations, and data availability.
              </p>
              
              <p>3. Users should always verify flight status directly with their airline.</p>
            </div>
            
            <p className="text-xs text-gray-500 mt-4">
              Last updated: December 2024
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TermsModal;
