import Home from '../components/Home'
import PyrosView from '../components/maps/pyros/View'
import PyrosEditor from '../components/maps/pyros/Edit'
import AnemosView from '../components/maps/anemos/View'
import AnemosEditor from '../components/maps/anemos/Edit'
import PagosView from '../components/maps/pagos/View'
import PagosEditor from '../components/maps/pagos/Edit'
import HydatosView from '../components/maps/hydatos/View'
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
            path: '/anemos',
            name: 'Anemos',
            component: AnemosView
        },
        {
            path: '/anemos/editor',
            name: 'Anemos-Editor',
            component: AnemosEditor
        },
        {
            path: '/pagos',
            name: 'Pagos',
            component: PagosView
        },
        {
            path: '/pagos/editor',
            name: 'Pagos-Editor',
            component: PagosEditor
        },
        {
            path: '/hydatos',
            name: 'Hydatos',
            component: HydatosView
        },
        {
            path: '/hydatos/editor',
            name: 'Hydatos-Editor',
            component: HydatosEditor
        }
    ]
}