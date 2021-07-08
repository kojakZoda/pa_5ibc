type loto is map(int, set(address))
type addOrRemoveAdmin is bool * address
type addOrRemoveBlackList is bool * address
type storage is record[
  admins: set(address);
  blackList: set(address);
  amountValue: tez;
  loto: loto;
  available: bool
]

type action is
| ManageAdmin of addOrRemoveAdmin
| NewPlayer of int
| EndGame of int
| WithDraw of tez
| NewGame
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
    testAndFail(amountValue > Tezos.balance, "NO ENOUGH FUND IN CONTRACT TO WITHDRAW");
    const listOperation : list(operation) = nil;
    var listOp := listOperation;
    const receiverContract : contract (unit) =
            case (Tezos.get_contract_opt (Tezos.sender) : option (contract (unit))) of
                Some (c) -> c
                | None -> (failwith ("Contract not found.") : contract (unit))
            end;
            const tx : operation = Tezos.transaction(unit, amountValue, receiverContract);
            listOp := tx # listOp;
}with(listOp, store)

function endGame(const value : int; var store: storage) : list(operation) * storage is 
block{
    isAdmin(store);
    testAndFail(value < 1 , "VALUE TOO LOW");
    testAndFail(value > 1000, "VALUE TOO HIGH");
    const mySet : set(address) = case store.loto[value] of
        | Some(x) -> x
        | None -> set[]
    end;
    const listOperation : list(operation) = nil;
    var listOp := listOperation;
    for i in set mySet block{
        const receiverContract : contract (unit) =
        case (Tezos.get_contract_opt (i) : option (contract (unit))) of
            Some (c) -> c
            | None -> (failwith ("Contract not found.") : contract (unit))
        end;
        const tx : operation = Tezos.transaction(unit, Tezos.balance, receiverContract);
        listOp := tx # listOp;
    };
    store.available := False;
}with(listOp, store)

function newPlayer(const value: int; var store: storage) : list(operation) * storage is
block{
    isBlackList(store);
    testAndFail(value > 1000, "VALUE TOO HIGH");
    testAndFail(value < 1, "VALUE TOO LOW");
    testAndFail(Tezos.amount =/= store.amountValue, "NOT ENOUGH FUND");
    const mySet : set(address) = case store.loto[value] of
       Some(x) -> Set.add(Tezos.sender,x) 
       | None  -> set[Tezos.sender]
    end;
    store.loto[value] := mySet;
    const listOperation : list(operation) = nil;
}with(listOperation, store)

function newGame(var store:storage) : list(operation) * storage is
block{
    isAdmin(store);
    store.available := True;
    const emptyMap :map(int, set(address)) = map[];
    store.loto := emptyMap;
    const listOperation : list(operation) = nil;
}with(listOperation, store)

function main (const action : action; const store : storage) : list(operation) * storage is
block{skip}with
  case action of
  | ManageAdmin(p) -> changeAdmin(p, store)
  | NewPlayer(p) -> newPlayer (p, store)
  | EndGame(p) -> endGame(p, store)
  | WithDraw(p) -> withDraw(p, store)
  | NewGame(_p) -> newGame(store)
  | ManageBlackList(p) -> changeBlackList(p,store)
  end;