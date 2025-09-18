import React, { useEffect, useRef } from 'react';

// Declare custom element for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'vapi-widget': {
        'assistant-id'?: string;
        'public-key'?: string;
      };
    }
  }
}

interface VapiWidgetProps {
  assistantId?: string;
  publicKey?: string;
}

const VapiWidget: React.FC<VapiWidgetProps> = ({ 
  assistantId = "bec3f3d3-4f55-4ff7-a1ff-8cff83ec2c5e",
  publicKey = "935f8f14-dfde-414b-9724-ae4c6e24b120"
}) => {
  useEffect(() => {
    // Custom element will be available after script loads
    const checkVapiLoaded = () => {
      if (customElements.get('vapi-widget')) {
        return;
      }
      setTimeout(checkVapiLoaded, 100);
    };
    checkVapiLoaded();
  }, []);

  return (
    <vapi-widget
      assistant-id={assistantId}
      public-key={publicKey}
    />
  );
};

export default VapiWidget;