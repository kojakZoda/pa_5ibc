type addOrRemoveAdmin is bool * address
type addOrRemoveBlackList is bool * address
type storage is record[
  admins: set(address);
  blackList: set(address);
  amountValue: tez;
  playerHand: int;
  available: bool;
  ready: bool;
  player: address;
  pack : list(int)
]


type action is
| ManageAdmin of addOrRemoveAdmin
| NewPlayer
| CardPack of list(int)
| StartGame 
| SendCoins
| WithDraw of tez
| ManageBlackList of addOrRemoveBlackList


function testAndFail(const check : bool; const error : string) : unit is  
    if check = True
    then failwith(error)
    else unit

function isAdmin(const store : storage) : unit is 
block{
    const isAdmin : bool = store.admins contains Tezos.sender;
    testAndFail(isAdmin = False, "NOT AN OWNER");
}with unit

 function changeAdmin(const addOrRemove: addOrRemoveAdmin; var store : storage): list(operation) * storage is
 block{
     isAdmin(store);
     if addOrRemove.0 = True
     then{
        const isAdmin : bool = store.admins contains addOrRemove.1;
        testAndFail(isAdmin = True, "ALREADY AN OWNER");
        store.admins := Set.add(addOrRemove.1, store.admins);
     } 
     else{
        const isAdmin : bool = store.admins contains addOrRemove.1;
        testAndFail(isAdmin = False, "ALREADY NOT AN OWNER");
        store.admins := Set.remove(addOrRemove.1, store.admins);
     } ;
     const listOperation : list(operation) = nil;
 }with(listOperation, store)

 function isBlackList(const store: storage) :unit is
 block{
     const isBlackListed : bool = store.blackList contains Tezos.sender;
     testAndFail(isBlackListed = True, "YOU ARE BLACKLISTED");
 }with unit

 function changeBlackList(const addOrRemove: addOrRemoveBlackList; var store : storage) : list(operation) * storage is
 block{
    isAdmin(store);
    if addOrRemove.0 = True
    then{
        const isBlackListed : bool = store.blackList contains addOrRemove.1;
        testAndFail(isBlackListed = True, "ALREADY BLACKLISTED");
        store.blackList := Set.add(addOrRemove.1, store.blackList);
    }else{
        const isBlackListed : bool = store.blackList contains addOrRemove.1;
        testAndFail(isBlackListed = False, "ALREADY NOT BLACKLISTED");
        store.blackList := Set.remove(addOrRemove.1, store.blackList);
    };
    const listOperation : list(operation) = nil;
 }with(listOperation, store)

function changeAmountValue(const value : tez; var store: storage) : list(operation) * storage is
block{
    isAdmin(store);
    store.amountValue := value;
    const listOperation : list(operation) = nil;
}with(listOperation, store)

function withDraw(const amountValue: tez; const store: storage) : list(operation) * storage is
block{
    isAdmin(store);
    const listOperation : list(operation) = nil;
    var listOp := listOperation;
    testAndFail(amountValue > Tezos.balance, "NO ENOUGH FUND IN CONTRACT TO WITHDRAW");
    const receiverContract : contract (unit) =
            case (Tezos.get_contract_opt (Tezos.sender) : option (contract (unit))) of
                Some (c) -> c
                | None -> (failwith ("Contract not found.") : contract (unit))
            end;
            const tx : operation = Tezos.transaction(unit, amountValue, receiverContract);
            listOp := tx # listOp;
}with(listOp, store)

function startGame(var store: storage) : list(operation) * storage is
block{
    testAndFail(store.ready = False, "CARD SEQUENCE NOT SET BY THE ADMINISTRATOR");
    testAndFail(Tezos.balance < store.amountValue*3n, "NOT ENOUGH FUND IN CONTRACT TO PLAY");
    if Tezos.sender =/= store.player
    then isAdmin(store);
    else skip;
    const listOperation : list(operation) = nil;
    var listOp := listOperation;
    var alreadyPaid := False;
    for i in list store.pack block{
        if store.playerHand = 21 and alreadyPaid = False
        then block{ 
            const receiverContract : contract (unit) =
            case (Tezos.get_contract_opt (store.player) : option (contract (unit))) of
                Some (c) -> c
                | None -> (failwith ("Contract not found.") : contract (unit))
            end;
            const tx : operation = Tezos.transaction(unit, store.amountValue * 3n, receiverContract);
            listOp := tx # listOp;
            alreadyPaid := True; 
        }
        else if store.playerHand < 21
        then store.playerHand := store.playerHand + i;
        else skip;
    };
    store.available := True;
    store.ready := False;
    const listOperation : list(operation) = nil;
}with(listOperation, store)

function cardPack(const cS : list(int); var store: storage) : list(operation) * storage is 
block{
    isAdmin(store);
    store.ready := True;
    store.pack := cS;
    const listOperation : list(operation) = nil;
}with(listOperation,store)

function initNewPlayer (var store: storage) : list(operation) * storage is
block{
    testAndFail(store.available = False, "THE GAME IS ALREADY LAUNCHED");
    testAndFail(Tezos.amount =/= store.amountValue, "PLEASE SEND THE RIGHT AMOUNT TO PLAY");
    testAndFail(Tezos.balance < store.amountValue*3n, "NO COINS TO PAY WINNER");
    isBlackList(store);
    store.playerHand := 0;
    store.player := Tezos.sender;
    store.available := False;
    const listOperation : list(operation) = nil;
}with(listOperation, store)

function sendCoins(var store: storage) : list(operation) * storage is
block{
    testAndFail(Tezos.amount = 0tez, "THEIR IS NO COINS IN YOUR TRANSACTION");
    const listOperation : list(operation) = nil;
}with(listOperation, store)



function main (const action : action; const store : storage) : list(operation) * storage is
block{skip}with
  case action of
  | ManageAdmin(p) -> changeAdmin(p, store)
  | WithDraw(p) -> withDraw(p, store)
  | SendCoins(_p) -> sendCoins(store)
  | NewPlayer(_p) -> initNewPlayer(store)
  | CardPack(p) -> cardPack(p, store)
  | StartGame(_p) -> startGame(store)
  | ManageBlackList(p) -> changeBlackList(p,store)
  end;