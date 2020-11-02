const formatAddress = (address) => {
  return address.slice(0, 6) + "..." + address.slice(-6);
};

export default formatAddress;
