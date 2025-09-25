// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// // import DatePicker from 'react-datepicker';
// // import 'react-datepicker/dist/react-datepicker.css';
// import './Dost.css';
// // import Header from "./dost-header";
// import Footer from "./dost-footer";

// export default function Dost() {
//     const [location, setLocation] = useState('');
//     const [destination, setDestination] = useState('');
//     const [selectedDate, setSelectedDate] = useState(new Date());

//     const isDateDisabled = (date) => { 
//         const currentDate = new Date();
//         return date > currentDate;
//     };
//     // date picker

//     // Function to handle search button click
//     const navigate = useNavigate();
//     const handleSearchClick = () => {
//         // Pass location, destination, and date as query parameters
//         navigate(`/SearchRide`, {
//             state:{
//                 location,
//                 destination,
//                 date: selectedDate.toISOString().split('T')[0],
//             }
//         })
//     }

//   return (

    
//     <div>
        
//         {/* <Header/> */}



//         <section id="section1">
//             <div className="buttonsContainer">
//                 <div className="links">
//                     <Link to="/SearchRide" className="button" id="btn">Search ride</Link>
//                     <Link to="/RideRegister" className="button" id="btn">+ Offer ride</Link>
//                 </div>
//                 <a href="#section6" className="button" id="download">Get app</a>
//             </div>
//             <div className="sub-container">
//                 <div id="sideA">
//                     <img src="https://img.freepik.com/free-photo/happy-man-driving-side-view_23-2148509004.jpg?size=626&ext=jpg&ga=GA1.1.1949036142.1694857602&semt=ais" alt=""/>        
//                 </div>
//                 <div id="sideB">
//                     <h1>Possible <span>for us</span></h1>

//                     <div className="paragraph">
//                         <p>
//                             Dost enable individuals to transform their 
//                             private cars into public taxis,fostering a
//                             community-driven network of shared rides 
//                         </p>
//                         <div className="offer-register">
//                             <a href="/SearchRide" className="button" id="ride-search">Search for ride</a>
//                             <Link to="/RideRegister" className="button" id="offer-ride">+ Offer a ride</Link>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </section>


//         <section id="section2">

//             <div id="sideA">
//                 <h2>Pick a ride now</h2>
//             </div>

//             <div id="sideB">
//                 <div className="pick_a_ride">

//                     <form>
//                         <input
//                             type="text"
//                             placeholder="Pick-up location"
//                             value={location}
//                             onChange={(e) => setLocation(e.target.value)}
//                         />
//                         <input
//                             type="text"
//                             placeholder="Destination"
//                             value={destination}
//                             onChange={(e) => setDestination(e.target.value)}
//                         />
//                         {/* <DatePicker
//                             selected={selectedDate}
//                             onChange={date => setSelectedDate(date)}
//                             minDate={new Date()}
//                             filterDate={isDateDisabled}
//                             className="cute-date-picker"
//                         /> */}
//                         <button 
//                             type="button" 
//                             className="cute-button"
//                             onClick={handleSearchClick}>Search
//                          </button>
//                     </form>

//                 </div>
//             </div>

//         </section>


//         <section id="section3">
//             <div id="sideA">
//                 <h2>Drive</h2>
//                 <p>
//                     Register to add your car for a rideshare 
//                 </p>

//                 <Link to="/ridesharePage#sectiona" className="button" id="register">Register</Link>
//             </div>

//             <div id="sideB">
//                 <img src="https://img.freepik.com/free-photo/handsome-elegant-man-car-salon_1157-30216.jpg?size=626&ext=jpg&ga=GA1.1.1949036142.1694857602&semt=ais" alt=""/>    
//             </div>
//         </section>


//         <section id="section4">
//             <div className="container">
//                 <div id="sideA">
//                     <h2>Deliver with Dost</h2>
//                     <img src="https://img.freepik.com/free-photo/happy-client-with-their-box-delivered_23-2149229243.jpg?size=626&ext=jpg&ga=GA1.1.1949036142.1694857602&semt=ais" alt=""/>
//                 </div>
        
//                 <div id="sideB">
                    
//                     <div className="header">
//                         <img src="https://img.freepik.com/free-photo/african-american-delivery-woman-talking-with-customer-mobile-phone-while-sitting-mini-van-view-is-through-window_637285-1248.jpg?size=626&ext=jpg&ga=GA1.1.1949036142.1694857602&semt=ais" alt=""/>
//                         <h4>Effortless Errands</h4>
//                     </div>
        
//                     <div className="header">
//                         <img src="https://img.freepik.com/free-photo/woman-checking-covid-19-mobile-application_53876-165463.jpg?size=626&ext=jpg&ga=GA1.1.1949036142.1694857602&semt=ais" alt=""/>
//                         <h4>Real-time tracking</h4>
//                     </div>
        
//                     <div className="header">
//                         <img src="https://img.freepik.com/free-photo/young-couple-moving-new-home-together-african-american-couple-with-cardboard-boxes_1157-40324.jpg?size=626&ext=jpg&ga=GA1.1.1949036142.1694857602&semt=ais" alt=""/>
//                         <h4>Trusted Delivery Partner</h4>
//                     </div>
//                 </div>
//             </div>

//             <div className="container2">
//                 <div id="sideA">
//                     <img src="https://img.freepik.com/free-photo/closeup-businessman-using-mobile-phone_53876-14790.jpg?size=626&ext=jpg&ga=GA1.1.1949036142.1694857602&semt=ais" alt=""/>
//                 </div>

//                 <div id="sideB">
//                     <a href="#section6" className="button" id="download">Get app</a>
//                 </div>
//             </div>

//             <section id="stn">
//                 <div className="container">
//                     <div className="sideA-sideB_container">
//                         <div className="side-container">
//                             <h2>Your safety is our priority</h2>
//                             <div id="side">
//                                 <div className="div1">
//                                     <div className="pgf">
//                                         <img src="https://cdn-icons-png.flaticon.com/128/1442/1442912.png" alt=""/>
//                                         <p>User verification and Authentication</p>
//                                     </div>

//                                     <div className="pgf">
//                                         <img src="https://cdn-icons-png.flaticon.com/128/1442/1442912.png" alt=""/>
//                                         <p>Privacy and Data protection</p>
//                                     </div>

//                                     <div className="pgf">
//                                         <img src="https://cdn-icons-png.flaticon.com/128/1442/1442912.png" alt=""/>
//                                         <p>Secure payment processing</p>
//                                     </div>

//                                     <div className="pgf">
//                                         <img src="https://cdn-icons-png.flaticon.com/128/1442/1442912.png" alt=""/>
//                                         <p>Vehicle safety checks</p>

//                                     </div>
//                                     <div className="pgf">
//                                         <img src="https://cdn-icons-png.flaticon.com/128/1442/1442912.png" alt=""/>
//                                         <p>Emergency assistance</p>
//                                     </div>

//                                     <Link to="/about" className="button" id="learn_more">Learn more</Link>
//                                 </div>
//                                 <div className="div2">
//                                     <img src="https://img.freepik.com/free-photo/kids-looking-outside-though-their-car-window_23-2148943100.jpg?size=626&ext=jpg&ga=GA1.1.1949036142.1694857602&semt=ais" alt=""/>    
//                                 </div>
//                             </div>
//                         </div>
                        
//                     </div>
//                 </div>
//             </section>
//         </section>


//         <section id="section5">
//             <section id="stn">
//                 <div className="container">
//                     <div className="sideA-sideB_container">
//                         <div className="side-container">
//                             <h2>Become a courier</h2>
//                             <div id="side">
//                                 <div className="div1">
//                                     <img src="https://img.freepik.com/free-photo/car-full-food-poor-people_23-2149012207.jpg?size=626&ext=jpg&ga=GA1.1.1949036142.1694857602&semt=ais" alt=""/>
//                                     <div className='registerBtn'>
//                                         <Link to="/businessPage" className="button" id="register">Become courier</Link>
//                                     </div>
//                                 </div>

//                                 <div className="div2">
//                                     <div className="div upper">
//                                         <h4>Flexible Earnings</h4>
//                                         <p>Use your own vehicle <br/> to earn money on your schedule</p>
//                                     </div>
//                                     <div className="div upper">
//                                         <h4>Easy Sign-Up</h4>
//                                         <p> Join quickly and start delivering <br/> with your car or motorbike</p>
//                                     </div>
//                                     <div className="div lower">
//                                         <h4>Diverse Deliveries</h4>
//                                         <p>Deliver various items, <br/> from packages to food orders</p>
//                                     </div>
//                                     <div className="div lower">
//                                         <h4>Safe & Secure</h4>
//                                         <p>Dost ensures your safety <br/> with robust features and support</p>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
                            
//                     </div>
//                 </div>
//             </section>
//         </section>

//         <Footer/>


//     </div>
//   )
// }