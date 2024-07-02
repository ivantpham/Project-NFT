import React from 'react';
import '../css/DutchAuction.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const EnglishAuction = () => {
    return (
        <div className="container-fluid dark-theme">

            <div className="row py-5">
                <div className="row">
                    <div className="col-md-4">
                        <div className="row">
                            <img src="../public/Itemcard.png" alt="Price History" className="img-fluid" />
                            <div className="list-details">
                                <p className="details-header">Details</p>
                                <div>Category: Art</div>
                                <div>Creator: Name1</div>
                                <div>Owner: Name2</div>
                                <div>Network: Polygon</div>
                                <div>Contract Address: 0x...</div>
                                <div>Token ID: 0x...</div>
                                <div>Platform Fee: .....</div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-8">
                        <h1 className="text-center auction-title">BLACK CAT</h1>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0 current-bid-header">Current Price</h5>
                            <div className="d-flex align-items-center">
                                <p className="mb-0 mr-2">0.013 LTP-00001 ETH</p>
                                <span className="text-muted">Auction End in</span>
                            </div>
                        </div>
                        <div className="d-flex justify-content-between mb-3">
                            <button className="btn btn-primary btn-lg">Buy Now</button>
                        </div>

                        <div className="activity-container mt-4">
                            <p className="activity-header">Activity</p>
                            <div className="activity-header d-flex justify-content-between">
                                <div>Name</div>
                                <div>Action</div>
                                <div>Trade Price</div>
                                <div>Listing Time</div>
                            </div>
                            <div className="activity-body">
                                <div className="activity-row d-flex justify-content-between">
                                    <div>Name1</div>
                                    <div>Listed</div>
                                    <div>0.012 LTP</div>
                                    <div>1 Day Ago</div>
                                </div>
                                <div className="activity-row d-flex justify-content-between">
                                    <div>Name2</div>
                                    <div>Bid</div>
                                    <div>0.013 LTP</div>
                                    <div>2 Hours Ago</div>
                                </div>
                                <div className="activity-row d-flex justify-content-between">
                                    <div>Name3</div>
                                    <div>Bought</div>
                                    <div>0.014 LTP</div>
                                    <div>3 Hours Ago</div>
                                </div>
                            </div>
                            <p className="price-history-header">Price History</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnglishAuction;
