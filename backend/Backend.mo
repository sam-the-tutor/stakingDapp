import Bool "mo:base/Bool";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Time "mo:base/Time";
import Float "mo:base/Float";
import ICRCLedger "canister:icrc1_ledger_canister";


actor class StakingDapp() = this {

   public type Stake = {
    amount : Nat;
    startTime : Int;
  };

  let tokenFee:Nat = 10000;

  let totalTimeInAYear :Int = 31536000000000000;

    let usersHashMap = HashMap.HashMap<Principal, Stake>(0, Principal.equal, Principal.hash);

 private func transfer_funds_from_user(user : Principal, _amount : Nat) : async Bool {

    let transferResults = await ICRCLedger.icrc2_transfer_from({
      spender_subaccount = null;

      from = {
        owner = user;
        subaccount = null;
      };
      to = {
        owner = Principal.fromActor(this);
        subaccount = null;
      };
      amount = _amount;
      fee = null;
      memo = null;
      created_at_time = null;

    });

    switch (transferResults) {
      case (#Ok(vakue)) { return true };
      case (#Err(error)) { return false };
    };

  };

  private func transfer_tokens_from_canister(_amount : Nat, user : Principal) : async Bool {

    let transferResults = await ICRCLedger.icrc1_transfer({
      from_subaccount = null;
      to = {
        owner = user;
        subaccount = null;
      };
      fee = null;
      amount = _amount;
      memo = null;
      created_at_time = null;
    });

    switch (transferResults) {
      case (#Ok(value)) { return true };
      case (#Err(error)) { return false };
    };

  };

private func calculate_rewards(_amount : Nat, _startTime : Int) : async Nat {
    let timeElapsed = Time.now() - _startTime;
    let realElapsedTime = Float.div(Float.fromInt(timeElapsed), Float.fromInt(totalTimeInAYear));
    let rewards = Float.mul(Float.mul(Float.fromInt(_amount), 0.08), realElapsedTime);
    return Int.abs(Float.toInt(rewards));
  };

  public shared ({ caller }) func claim_rewards() : async Result.Result<(), Text> {
    switch (usersHashMap.get(caller)) {
      case (null) {
        return #err("no user found");
      };
      case (?user) {
        //get their rewards
        let rewards = await calculate_rewards(user.amount, user.startTime);
        if (rewards < 30000) {
          return #err("rewards too low, cant be claimed, keep staking");
        } else {
          let transfer = await transfer_tokens_from_canister(rewards-10000, caller);
          if (transfer) {
            usersHashMap.put(caller, { user with startTime = Time.now() });
            return #ok();
          } else {
            return #err("reward transfer failed");
          };
        };
      };
    };
  };

public shared ({ caller }) func stake_tokens(_amount : Nat) : async Result.Result<(), Text> {
    let results = await transfer_funds_from_user(caller, _amount);
    if (results) {
      usersHashMap.put(caller,{amount = _amount;startTime = Time.now();},);
      return #ok();
    } else {
      return #err("unable to stake tokens");
    };
  };

   public shared ({ caller }) func unstake_tokens() : async Result.Result<(), Text> {
    switch (usersHashMap.get(caller)) {
      case (?data) {
        let rewards = await calculate_rewards(data.amount, data.startTime);
        let transferResults = await transfer_tokens_from_canister(rewards, caller);
        if (transferResults) {
          let transferPrincipal = await transfer_tokens_from_canister(data.amount -20000, caller);
          if (transferPrincipal) {
            usersHashMap.delete(caller);
            return #ok();
          } else {
            return #err("cant transfer principal");
          };
        } else {
          return #err("cant transfer rewards");
        };
      };
      case (null) { return #err("no user found") };
    };
  };

 public func get_user_stake_info(user:Principal):async Result.Result<{amount:Nat;rewards:Nat;startTime:Int;},Text>{
        switch(usersHashMap.get(user)){
          case(?user){
            let rewards = await calculate_rewards(user.amount,user.startTime);
            return #ok({
              amount=user.amount;
              rewards= rewards;
              startTime=user.startTime;
            });
          };
          case(null){return #err("no user found")};
        }
  };













}
