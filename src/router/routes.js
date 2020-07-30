import Home from '../components/Home'
import PyrosView from '../components/maps/pyros/View'
import PyrosEditor from '../components/maps/pyros/Edit'
import AnemosEditor from '../components/maps/anemos/Edit'
import PagosEditor from '../components/maps/pagos/Edit'
import HydatosEditor from '../components/maps/hydatos/Edit'

export default {
    routes: [
        {
            path: '/',
            name: 'Home',
            component: Home
        },
        {
            path: '/pyros',
            name: 'Pyros',
            component: PyrosView
        },
        {
            path: '/pyros/editor',
            name: 'Pyros-Editor',
            component: PyrosEditor
        },
        {
            path: '/anemos/editor',
            name: 'Anemos-Editor',
            component: AnemosEditor
        },
        {
            path: '/pagos/editor',
            name: 'Pagos-Editor',
            component: PagosEditor
        },
        {
            path: '/hydatos/editor',
            name: 'Hydatos-Editor',
            component: HydatosEditor
        }
    ]
}