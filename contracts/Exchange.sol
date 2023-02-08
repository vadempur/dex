// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";

contract Exchange {
    address public feeAccount;
    uint256 public feeParcent;

    mapping(address => mapping(address => uint256)) public tokens;
    mapping(uint256 => _Order) public orders;
    uint256 public orderCount;
    mapping(uint256 => bool) public orderCancelled; 


    event Deposit(
        address token,
        address user,
        uint256 amount,
        uint256 balance
        );

    event Withdraw(
        address token,
        address user ,
        uint256 amount, 
        uint256 balance
     );

    event Order (
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp 
    ); 

    event Cancel (
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp 
    );

     struct _Order {
        //atttributes of an order
        uint256 id; //unique identifier for order
        address user; //user who made order
        address tokenGet; //address of the token they recieve
        uint256 amountGet; //amount they recive
        address tokenGive; //address of token  they gave
        uint256 amountGive; //Amount they give
        uint256 timestamp; //When order was created
     }
    
    constructor(address _feeAccount ,uint256 _feeparcent) {
        feeAccount = _feeAccount;
        feeParcent = _feeparcent;
    }

    //Deposit tokens
    function depositTokens(address _token ,uint256 _amount) public {
        //trasfer token to exchange
        Token(_token).transferFrom(msg.sender, address(this), _amount);
        //update user balance
        tokens[_token][msg.sender] = tokens[_token][msg.sender] + _amount;
        //emit deposit event
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    //withdraw tokens
    function withdrawTokens(address _token ,uint256 _amount) public {
        //Update user balance
        require(tokens[_token][msg.sender] >= _amount);

         Token(_token).transfer(msg.sender, _amount);

        //Transfer tokens to user
         tokens[_token][msg.sender] = tokens[_token][msg.sender] - _amount;

         //emit withdraw

         emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
        
    }

    function balanceOf(address _token ,address _user) 
        public
        view 
        returns(uint256) 
    {
      return tokens[_token][_user];
    }

    //MAKE & CANCEL ORDERS
    // Token  give
    // Token  get 
    function makeOrder(
        address _tokenGet ,
        uint256 _amountGet ,
        address _tokenGive,
        uint256 _amountGive
        ) public
        {
        //require token balance
        require(balanceOf(_tokenGive,msg.sender) >= _amountGive);

        //Instantes an  new order
         orderCount =orderCount+1;
         orders[orderCount] = _Order(
                orderCount,
                msg.sender,
                _tokenGet,
                _amountGet,
                _tokenGive,
                _amountGive,
                block.timestamp
            );

          //emit an event

          emit Order(
              orderCount,
              msg.sender, 
              _tokenGet, 
              _amountGet, 
              _tokenGive,
              _amountGive, 
              block.timestamp
              );  

    }


    function cancelOrder(uint256 _id ) public {
      //fetch order
      _Order storage _order = orders[_id];

     //ensure the caller of the function is the owner of the order
     require(address(_order.user) == msg.sender);

     //id must exist
      require(_order.id == _id);
    

     //cancel the order
      orderCancelled[_id] = true;

     //Emit event
      emit Cancel(_order.id, msg.sender, _order.tokenGet , _order.amountGet, _order.tokenGive, _order.amountGive, block.timestamp);

    }

}
