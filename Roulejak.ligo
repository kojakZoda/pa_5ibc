type players is map(address,int)
type addOrRemoveAdmin is bool * address
type addOrRemoveBlackList is bool * address
type storage is record[
  amountValue: tez;
  admins: set(address);
  blackList: set(address);
  players: players;
  count: int;
  available: bool
]
type action is
| ManageAdmin of addOrRemoveAdmin
| NewPlayer of int
| NewGame of int
| EndGame of int
| ChangeAmountValue of tez
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

 function newGame(var store : storage) : list(operation) * storage is
 block{
  isAdmin(store);
  const mapTemp : players = Map.empty;
  store.players := mapTemp;
  store.count := 0;
  store.available := True;
  const listOperation : list(operation) = nil;
 }with (listOperation, store)

function addNewPlayer(const a : int; var store : storage) : list(operation) * storage is 
  block {
    isBlackList(store);
    testAndFail(store.available = False, "WAIT FOR AN ADMIN TO RESET THE GAME");
    if Tezos.amount =/= store.amountValue
    then failwith("Amount send not equal as amount price")
    else{
        testAndFail(a > 50, "Value to high");
        testAndFail(a < 0, "Value to low");
        
        var playersTemp : map(address, int) := store.players;
        testAndFail(Map.size(playersTemp) >= 10n, "Game full");
        case playersTemp[Tezos.sender] of
            Some(_x) -> failwith("You are already registered")
            | None -> playersTemp[Tezos.sender] := a
        end;
        store.players:=playersTemp;
        store.count := store.count+1;
    };
    const listOperation : list(operation) = nil;
  } with (listOperation,store)

 function endGame(const value : int; var store : storage) : list(operation) * storage is
 block{
   isAdmin(store);
   store.available := False;
   var setToPay : list(address) := nil;
   testAndFail(Map.size(store.players) = 10n, "NO ENOUGTH PLAYERS IN GAME");
   for key -> v in map store.players block {
    if value = v
    then setToPay := key # setToPay
    else setToPay := setToPay
  }; 
  const listOperation : list(operation) = nil;
  var listOp := listOperation;
  const amountToPay : tez = Tezos.balance / List.size(setToPay);
  for i in list setToPay block{
      const receiverContract : contract (unit) =
      case (Tezos.get_contract_opt (i) : option (contract (unit))) of
        Some (c) -> c
      | None -> (failwith ("Contract not found.") : contract (unit))
      end;
      const tx : operation = Tezos.transaction(unit, amountToPay, receiverContract);
      listOp := tx # listOp;
    };
  store.available := False;
 }with (listOp, store)


 function withDraw(const amountValue: tez; const store: storage) : list(operation) * storage is
block{
    isAdmin(store);
    const listOperation : list(operation) = nil;
    var listOp := listOperation;
    testAndFail(amountValue > Tezos.balance, "TO HIGH VALUE TO WITHDRAW");
    const receiverContract : contract (unit) =
            case (Tezos.get_contract_opt (Tezos.sender) : option (contract (unit))) of
                Some (c) -> c
                | None -> (failwith ("Contract not found.") : contract (unit))
            end;
            const tx : operation = Tezos.transaction(unit, amountValue, receiverContract);
            listOp := tx # listOp;
}with(listOp, store)



function main (const action : action; const store : storage) : list(operation) * storage is
block{skip}with
  case action of
  | ManageAdmin(p) -> changeAdmin(p, store)
  | NewGame(_p) -> newGame(store)
  | NewPlayer(p) -> addNewPlayer (p, store)
  | EndGame(p) -> endGame(p, store)
  | ChangeAmountValue(p) -> changeAmountValue(p, store)
  | WithDraw(p) -> withDraw(p, store)
  | ManageBlackList(p) -> changeBlackList(p,store)
  end;
