// import React from 'react'
// import { Link } from "react-router-dom";
// import './dost-footer.css';

// function Footer() {
//   return (
//     <div>
//         <section id="section6">
//             <div className="container">
//                 <div className="head-paragraph">
//                     <h1>Ride with us</h1>
//                     <p>Unlock income potential
//                         Drive passengers or deliver packages
//                         using your car. Seamless app experience for flexible earnings</p>
//                 </div>
//                 <div className="download">
//                     <div className="apple-google">
//                         <h3>Get Dost</h3>
//                         <div className="store-container">

//                             <div className="button" id="stores">
//                                 <img src="https://cdn-icons-png.flaticon.com/128/3128/3128279.png" alt=""/>
//                                 <span>Google play</span>
//                             </div>
//                         </div>
//                     </div>
//                     <div className="scan">
//                         <div className="div">
//                             <p>Scan to get the app</p>
//                             <div className="scan-code">
//                                 <img src="https://cdn-icons-png.flaticon.com/128/714/714390.png" alt=""/>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </section>


//         <section id="section7">
//             <h2>Work with us</h2>

//             <div className="register">
//                 <Link className="ride" to="/RideRegister">
//                     Publish a Drive
//                     <img src="https://cdn-icons-png.flaticon.com/128/271/271228.png"/>
//                 </Link>
//                 <Link to="/businessPage">
//                     Register to courier
//                     <img src="https://cdn-icons-png.flaticon.com/128/271/271228.png"/>
//                 </Link>
//             </div>

//             <footer>
//                 <div className="upper-container">
//                     <div className="logo">
//                         <Link to='/'>
//                             <svg width="72" height="25" viewBox="0 0 72 25" fill="none" xmlns="http://www.w3.org/2000/svg">
//                                 <path d="M18.84 0.255999V24H14.072V22.016C12.8347 23.5093 11.0427 24.256 8.696 24.256C7.07467 24.256 5.60267 23.8933 4.28 23.168C2.97867 22.4427 1.95467 21.408 1.208 20.064C0.461333 18.72 0.0880001 17.1627 0.0880001 15.392C0.0880001 13.6213 0.461333 12.064 1.208 10.72C1.95467 9.376 2.97867 8.34133 4.28 7.616C5.60267 6.89067 7.07467 6.528 8.696 6.528C10.8933 6.528 12.6107 7.22133 13.848 8.608V0.255999H18.84ZM9.56 20.16C10.8187 20.16 11.864 19.7333 12.696 18.88C13.528 18.0053 13.944 16.8427 13.944 15.392C13.944 13.9413 13.528 12.7893 12.696 11.936C11.864 11.0613 10.8187 10.624 9.56 10.624C8.28 10.624 7.224 11.0613 6.392 11.936C5.56 12.7893 5.144 13.9413 5.144 15.392C5.144 16.8427 5.56 18.0053 6.392 18.88C7.224 19.7333 8.28 20.16 9.56 20.16ZM31.6523 24.256C29.8389 24.256 28.2069 23.8827 26.7563 23.136C25.3269 22.368 24.2069 21.312 23.3963 19.968C22.5856 18.624 22.1803 17.0987 22.1803 15.392C22.1803 13.6853 22.5856 12.16 23.3963 10.816C24.2069 9.472 25.3269 8.42667 26.7563 7.68C28.2069 6.912 29.8389 6.528 31.6523 6.528C33.4656 6.528 35.0869 6.912 36.5163 7.68C37.9456 8.42667 39.0656 9.472 39.8763 10.816C40.6869 12.16 41.0923 13.6853 41.0923 15.392C41.0923 17.0987 40.6869 18.624 39.8763 19.968C39.0656 21.312 37.9456 22.368 36.5163 23.136C35.0869 23.8827 33.4656 24.256 31.6523 24.256ZM31.6523 20.16C32.9323 20.16 33.9776 19.7333 34.7883 18.88C35.6203 18.0053 36.0363 16.8427 36.0363 15.392C36.0363 13.9413 35.6203 12.7893 34.7883 11.936C33.9776 11.0613 32.9323 10.624 31.6523 10.624C30.3723 10.624 29.3163 11.0613 28.4843 11.936C27.6523 12.7893 27.2363 13.9413 27.2363 15.392C27.2363 16.8427 27.6523 18.0053 28.4843 18.88C29.3163 19.7333 30.3723 20.16 31.6523 20.16ZM50.221 24.256C48.7917 24.256 47.3943 24.0853 46.029 23.744C44.6637 23.3813 43.5757 22.9333 42.765 22.4L44.429 18.816C45.197 19.3067 46.125 19.712 47.213 20.032C48.301 20.3307 49.3677 20.48 50.413 20.48C52.525 20.48 53.581 19.9573 53.581 18.912C53.581 18.4213 53.293 18.0693 52.717 17.856C52.141 17.6427 51.2557 17.4613 50.061 17.312C48.653 17.0987 47.4903 16.8533 46.573 16.576C45.6557 16.2987 44.8557 15.808 44.173 15.104C43.5117 14.4 43.181 13.3973 43.181 12.096C43.181 11.008 43.4903 10.048 44.109 9.216C44.749 8.36267 45.6663 7.70133 46.861 7.232C48.077 6.76267 49.5063 6.528 51.149 6.528C52.365 6.528 53.5703 6.66667 54.765 6.944C55.981 7.2 56.9837 7.56267 57.773 8.032L56.109 11.584C54.5943 10.7307 52.941 10.304 51.149 10.304C50.0823 10.304 49.2823 10.4533 48.749 10.752C48.2157 11.0507 47.949 11.4347 47.949 11.904C47.949 12.4373 48.237 12.8107 48.813 13.024C49.389 13.2373 50.3063 13.44 51.565 13.632C52.973 13.8667 54.125 14.1227 55.021 14.4C55.917 14.656 56.6957 15.136 57.357 15.84C58.0183 16.544 58.349 17.5253 58.349 18.784C58.349 19.8507 58.029 20.8 57.389 21.632C56.749 22.464 55.8103 23.1147 54.573 23.584C53.357 24.032 51.9063 24.256 50.221 24.256ZM71.797 23.168C71.3063 23.5307 70.6983 23.808 69.973 24C69.269 24.1707 68.533 24.256 67.765 24.256C65.6957 24.256 64.1063 23.7333 62.997 22.688C61.8877 21.6427 61.333 20.1067 61.333 18.08V2.976H66.325V7.168H70.581V11.008H66.325V18.016C66.325 18.7413 66.5063 19.3067 66.869 19.712C67.2317 20.096 67.7543 20.288 68.437 20.288C69.205 20.288 69.8877 20.0747 70.485 19.648L71.797 23.168Z" fill="white"/>
//                                 <circle cx="31.5" cy="15.5" r="5.5" fill="white"/>
//                                 <ellipse cx="9" cy="15.5" rx="6" ry="5.5" fill="white"/>
//                             </svg>
//                         </Link>
                        
                        
//                     </div>
//                     <div className="infos-container">
//                         <div className="info">
//                             <h3>Company</h3>
//                             <div className="links">
//                                 <Link to="/about">About</Link>
//                                 <Link to="/businessPage">Join us</Link>
//                             </div>
//                         </div>
//                         <div className="info">
//                             <h3>Account</h3>
//                             <div className="links">
//                                 <a href="/SearchRide">Search for a ride</a>
//                                 <Link to="/RideRegister">Register to drive</Link>
//                                 <Link to="/courier">Sign up to courier</Link>
//                                 <Link to="/ManageRide">Manage your rides</Link>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="apple-google">
//                     <div className="store-container">

//                         <div className="button" id="stores">
//                             <img src="https://cdn-icons-png.flaticon.com/128/3128/3128279.png" alt=""/>
//                             <span>Google play</span>
//                         </div>
//                     </div>
//                 </div>

//             </footer>
//         </section>
//     </div>
//   )
// }

// export default Footer