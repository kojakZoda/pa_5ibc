import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import Landing from './components/landing/Landing';
import Callback from './components/callback/Callback';
import Roulette from './components/games/Roulette';
import Lotto from "./components/games/Lotto";
import Blackjack from './components/games/Blackjack';
import LandingAdmin from './components/admin/landing/LandingAdmin';
import AdminRoulette from './components/admin/games/AdminRoulette';
import AdminLotto from './components/admin/games/AdminLotto';
import AdminBlackjack from './components/admin/games/AdminBlackjack';

function App() {
  return (
    <Router>
      <div>
        <Switch>
          <Route path="/" exact component={Landing} />
          <Route path="/callback" component={Callback} />
          <Route path="/roulette" component={Roulette} />
          <Route path="/lotto" component={Lotto} />
          <Route path="/blackjack" component={Blackjack}/>
          <Route path="/admin" exact component={LandingAdmin} />
          <Route path="/admin/roulette" component={AdminRoulette} />
          <Route path="/admin/lotto" component={AdminLotto} />
          <Route path="/admin/blackjack" component={AdminBlackjack} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
