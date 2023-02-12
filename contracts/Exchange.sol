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
    mapping(uint256 => bool) public orderFilled ; 



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

    event Trade (
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        address creator,
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
         orderCount ++;
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

   //Executing order
    function fillOrder(uint256 _id) public {
        // must be valid order
        require(_id>0 && _id <= orderCount ,"Order does not exist");

        require(!orderFilled[_id]);
        //order can't be cancelled
        require(!orderCancelled[_id]);

        //fetch order
        _Order storage _order = orders[_id];

        //swapping tokens
        _trade(
            _order.id,
            _order.user,
            _order.tokenGet,
            _order.amountGet,
            _order.tokenGive,
            _order.amountGive
            );
        
        orderFilled[_id] = true;
    }

    function _trade(
        uint256 _orderId,
        address _user,
        address _tokenGet,
        uint256 _amountGet,
        address _tokenGive,
        uint256 _amountGive
    ) internal {

        //fee is paid by the user who filled the order (msg.sender)
        //fee is deducted from _amountGet

        uint256 _feeAmount = (_amountGet * feeParcent)/100;

        //Do trade here
        //msg.sender is the user who filled the order while _user is who created the order
        tokens[_tokenGet][msg.sender] = tokens[_tokenGet][msg.sender] - (_amountGet+_feeAmount);
        tokens[_tokenGet][_user] = tokens[_tokenGet][_user] + _amountGet;

        //charge the fees
        tokens[_tokenGet][feeAccount]  = tokens[_tokenGet][feeAccount]+ _feeAmount;

        tokens[_tokenGive][_user] = tokens[_tokenGive][_user] - _amountGive;
        tokens[_tokenGive][msg.sender] = tokens[_tokenGive][msg.sender] + _amountGive;
        
        //emit a trade event

        emit Trade(
            _orderId,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            _user,
            block.timestamp
        );
        

    }
}
