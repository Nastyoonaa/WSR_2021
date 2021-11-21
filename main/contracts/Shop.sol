// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Shop {
  address public owner;
  uint currentBlock;

  enum Roles { Customer, Seller, Admin }

  struct User {
    uint id;
    string givenName;
    string familyName;
    string login;
    bytes32 password;
    uint role; // роли пользователя 0 - покупатель, 1 - продавец, 2 - администратор
    uint balance;
    bytes32 twoFAcode;
  }

  struct Market {
    uint id;
    string name;
    uint rating;
    uint balance;
    string city;
  }

  struct Feedback {
    uint id;
    address marketId;
    address userId;
    uint score;
    string text;
    string answer;
    uint like;
    uint dislike;
  }

  struct RequestRoles {
    uint userId;
    uint role;
    bool isActive;
  }

  struct RequestRmRoles {
    uint userId;
    bool isActive;
  }

  struct RequestMoney {
    uint marketId;
    bool isActive;
  }

  struct Bank {
    string login;
    bytes32 password;
    address payable bankAddr;
    uint balance;
  }

  struct Provider {
    string login;
    bytes32 password;
    address payable providerAddr;
    uint balance;
  }

  User[] public users;
  Market[] public markets;
  Feedback[] public feedbacks;
  RequestRoles[] public rroles;
  RequestMoney[] public rmoney;
  RequestRmRoles[] public rrmroles;

  address[] market_ids;

  mapping(address => uint) public userId;
  mapping(address => uint) public marketId;
  mapping(address => User[]) public sellersToMarket;

  modifier onlyOwner() {
    require(msg.sender == owner, "Must be owner");
    _;
  }

  modifier onlyAdmin() {
    require(users[userId[msg.sender]].role == 2, "Can only admin");
    _;
  }

  modifier onlySeller() {
    require(users[userId[msg.sender]].role == 1, "Can only seller");
    _;
  }

  modifier onlyCustomer() {
    require(users[userId[msg.sender]].role == 0, "Can only customer");
    _;
  }

  constructor() {
    owner = msg.sender;

    Bank memory bank;
    bank.login = "bank";
    bank.password = keccak256(abi.encodePacked("1223456789"));
    // bank.bankAddr = "0xc30e73548f2daaa10950be7b51affc69fce0dbd3";
    bank.balance = 100000;

    Provider memory golden_fish;
    golden_fish.login = "goldfish";
    // golden_fish.providerAddr = "0xb25afb438ae3be47f879cffc84432aef05d628e8";
    golden_fish.balance = 100;
    golden_fish.password = keccak256(abi.encodePacked("1223456789"));


  }

  function register(
    string memory _givenName,
    string memory _familyName,
    string memory _password,
    string memory _login
  ) public onlyOwner {
    require(keccak256(abi.encodePacked(_givenName)) != keccak256(abi.encodePacked("")), "givenName is required");
    require(keccak256(abi.encodePacked(_familyName)) != keccak256(abi.encodePacked("")), "familyName is required");
    require(keccak256(abi.encodePacked(_password)) != keccak256(abi.encodePacked("")), "Password is required");
    require(keccak256(abi.encodePacked(_login)) != keccak256(abi.encodePacked("")), "login is required");
    require(keccak256(abi.encodePacked(users[userId[msg.sender]].login)) == keccak256(abi.encodePacked(_login)), "User not found");

    User memory newUser;
    uint _userId = userId[msg.sender] = users.length + 1;
    newUser.id = _userId;
    newUser.login = _login;
    newUser.givenName = _givenName;
    newUser.familyName = _familyName;
    newUser.password = keccak256(abi.encodePacked(_password));
    newUser.balance = 0;
    newUser.role = 0;
  }

  function getSellerRole() public {
    require(users[userId[msg.sender]].role >= 0, "User must be registered");
    uint _userId = userId[msg.sender];
    rroles.push(RequestRoles(_userId, 1, true));
  }

  function getAdminRole() public {
    require(users[userId[msg.sender]].role >= 0, "User must be registered");
    uint _userId = userId[msg.sender];
    rroles.push(RequestRoles(_userId, 2, true));
  }

  function setSellerRole(uint _userId) public onlyAdmin {
    for(uint i = 0; i < rroles.length; i++){
      if(rroles[i].userId == _userId) {
        users[_userId].role = 1;
        rroles[i].isActive = false;
      }
    }
  }

  function requestRemoveRole() public onlyOwner {
    require(users[userId[msg.sender]].role >= 0, "User must be registered");
    uint _userId = userId[msg.sender];
    rrmroles.push(RequestRmRoles(_userId, true));
  }

  function setAdminRole(uint _userId) public onlyAdmin {
    for(uint i = 0; i < rroles.length; i++){
      if(rroles[i].userId == _userId) {
        users[_userId].role = 2;
        rroles[i].isActive = false;
      }
    }
  }

  function removeRole(uint _userId) public onlyOwner onlyAdmin {
    users[_userId].role = 0;
  }

  function getMoney(address _marketAddr) public onlySeller {
    rmoney.push(RequestMoney(marketId[_marketAddr], true));
  }

  function auth(
    string memory _login,
    string memory _password
  ) public view {
    require(
      keccak256(abi.encodePacked(_login)) == keccak256(abi.encodePacked(users[userId[msg.sender]].login)) &&
      keccak256(abi.encodePacked(_password)) == users[userId[msg.sender]].password, "Check your input data"
    );
  }

  function addFeedback(
    address _marketAddress,
    uint _score,
    string memory _text
  ) public onlyCustomer {
    require(users[userId[msg.sender]].role >= 0, "User must be registered");
    feedbacks.push(Feedback(feedbacks.length + 1, _marketAddress, msg.sender, _score, _text, "", 0, 0));
  }

  function switchToAdmin() public returns (bool result){
    require(users[userId[msg.sender]].role < 2, "Access denied");
    users[userId[msg.sender]].role = 2;
    return true;
  }

  function switchToSeller() public returns (bool result) {
    require(users[userId[msg.sender]].role < 1, "Access denied");
    users[userId[msg.sender]].role = 1;
    return true;
  }

  function switchToCustomer() public returns (bool result) {
    users[userId[msg.sender]].role = 0;
    return true;
  }

  function addAnswer(
    uint _feedbackId,
    string memory _text
  ) public {
    require(users[userId[msg.sender]].role >= 0, "User must be registered");
    feedbacks[_feedbackId].text = _text;
  }

  function addLike (
     uint _feedbackId
  ) public {
    require(users[userId[msg.sender]].role >= 0, "User must be registered");
    feedbacks[_feedbackId].like++;
  }

  function addDislike (
     uint _feedbackId
  ) public {
    require(users[userId[msg.sender]].role >= 0, "User must be registered");
    feedbacks[_feedbackId].dislike++;
  }
}
