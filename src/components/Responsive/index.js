
import { useMediaQuery } from 'react-responsive';

export const useSizeXs = () => useMediaQuery({ maxWidth: 600 });

export const useSizeSm = () => useMediaQuery({ minWidth: 600, maxWidth: 900 });
export const useSizeSmUp = () => useMediaQuery({ minWidth: 600 });
export const useSizeSmDown = () => useMediaQuery({ maxWidth: 900 });

export const useSizeMd = () => useMediaQuery({ minWidth: 900, maxWidth: 1200 });
export const useSizeMdUp = () => useMediaQuery({ minWidth: 900 });
export const useSizeMdDown = () => useMediaQuery({ maxWidth: 1200 });

export const useSizeLg = () =>
  useMediaQuery({ minWidth: 1200, maxWidth: 1536 });
export const useSizeLgUp = () => useMediaQuery({ minWidth: 1200 });
export const useSizeLgDown = () => useMediaQuery({ maxWidth: 1536 });

export const useSizeXl = () => useMediaQuery({ maxWidth: 1536 });

export const ViewportXSmall = ({ children }) => {
  const render = useSizeXs();

  return render ? children : null;
};

export const ViewportSmall = ({ children }) => {
  const render = useSizeSm();

  return render ? children : null;
};

export const ViewportSmallUp = ({ children }) => {
  const render = useSizeSmUp();

  return render ? children : null;
};

export const ViewportSmallDown = ({ children }) => {
  const render = useSizeSmDown();

  return render ? children : null;
};

export const ViewportMedium = ({ children }) => {
  const render = useSizeMd();

  return render ? children : null;
};

export const ViewportMediumUp = ({ children }) => {
  const render = useSizeMdUp();

  return render ? children : null;
};

export const ViewportMediumDown = ({ children }) => {
  const render = useSizeMdDown();

  return render ? children : null;
};

export const ViewportLarge = ({ children }) => {
  const render = useSizeLg();

  return render ? children : null;
};

export const ViewportLargeUp = ({ children }) => {
  const render = useSizeLgUp();

  return render ? children : null;
};

export const ViewportLargeDown = ({ children }) => {
  const render = useSizeLgDown();

  return render ? children : null;
};

export const ViewportXLarge = ({ children }) => {
  const render = useSizeXl();

  return render ? children : null;
};
