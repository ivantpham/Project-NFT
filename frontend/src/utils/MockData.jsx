const nftImages = ['/nft.png'];

const categories = ['Art', 'Football', 'Idol', 'Anime', 'Entertainment', 'Life'];

const statuses = ['Coming soon', 'Open for sale', 'Sold out'];

const names = ['Thi', 'Phát', 'Lợi', 'Tuấn'];

const namesimages = ['Cute Cat', 'Black Cat', 'Big Cat', 'Pink Cat'];

const filetype = ['jpg', 'png', 'gif', 'jpeg'];

const generateRandomNFT = () => {
  const randomImageIndex = Math.floor(Math.random() * nftImages.length);
  const randomPrice = (Math.random() * 10).toFixed(2);
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  const randomFileType = filetype[Math.floor(Math.random() * filetype.length)];
  const randomNamesImages = namesimages[Math.floor(Math.random() * namesimages.length)]; 
  const randomOwner = names[Math.floor(Math.random() * names.length)];
  const randomCreator = names[Math.floor(Math.random() * names.length)]; 

  return {
    image: nftImages[randomImageIndex],
    name: randomNamesImages,         
    description: 'Tác phẩm nghệ thuật vượt thời gian',
    price: randomPrice,
    owner: randomOwner,             
    creator: randomCreator,        
    createdAt: new Date().toLocaleDateString(),
    contractAddress: '0x' + Math.random().toString(16).substr(2, 40),
    tokenId: Math.floor(Math.random() * 10000) + 1,
    category: randomCategory,
    filetype: randomFileType,
    LTP: (Math.random() * 10).toFixed(2),
    date: new Date().toLocaleDateString(),
    likes: Math.floor(Math.random() * 1000),
    views: Math.floor(Math.random() * 5000),
    isSale: Math.random() < 0.5,
    status: randomStatus,
  };
};

const mockdata = Array.from({ length: 32 }, generateRandomNFT);

export default mockdata;