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
                1. This service provides estimates and predictions based on publicly available data sources. All predictions are probabilistic in nature and should not be considered guarantees.
              </p>
              
              <p>
                2. The accuracy of predictions depends on multiple factors including, but not limited to, weather conditions, air traffic, airline operations, and data availability.
              </p>
              
              <p>
                3. This service and its operators shall not be held liable for:
              </p>
              <ul className="pl-6 space-y-1 list-disc">
                <li>Any inaccuracies in predictions or estimates</li>
                <li>Decisions made based on the provided information</li>
                <li>Financial losses or missed connections due to reliance on predictions</li>
                <li>Any direct, indirect, incidental, or consequential damages</li>
              </ul>
              
              <p>
                4. Users should always verify flight
