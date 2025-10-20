// TypeScript declarations for Tawk.to Live Chat
declare global {
  interface Window {
    Tawk_API?: {
      onLoad?: () => void;
      onStatusChange?: (status: string) => void;
      hideWidget?: () => void;
      showWidget?: () => void;
      toggle?: () => void;
      maximize?: () => void;
      minimize?: () => void;
      getWindowType?: () => string;
      getStatus?: () => string;
      isChatMaximized?: () => boolean;
      isChatMinimized?: () => boolean;
      isChatHidden?: () => boolean;
      isChatOngoing?: () => boolean;
      isVisitorEngaged?: () => boolean;
      endChat?: () => void;
      setAttributes?: (attributes: Record<string, any>, callback?: () => void) => void;
      addEvent?: (event: string, metadata?: Record<string, any>, callback?: () => void) => void;
      addTags?: (tags: string[], callback?: () => void) => void;
      removeTags?: (tags: string[], callback?: () => void) => void;
      customStyle?: Record<string, any>;
      visitor?: Record<string, any>;
    };
    Tawk_LoadStart?: Date;
  }
}

export {};