import React, { Component } from 'react';
import * as moment from 'moment';
import QuizQuestion from './QuizQuestion';
import styled from 'styled-components'
import * as _ from 'lodash';
import { ActionButton } from '../Forms/Button';
import { Title } from '../Forms/Text'
import { ColumnContainer, RowContainer } from '../Forms/Containers'

const options = {
    GR: { name: 'GR-18', asset: 'item_gr-18_0.png' }, 
    Package: { name: 'The Package', asset:  'item_package_0.png' }, 
    GROLD: { name: 'GR-17', asset: 'icon_gr-17_sadness.png' },
    MAYA: { name: 'MAYA', asset: 'icon_maya.png' }, 
    Scrubb: { name: 'a Scrubb', asset: 'icon_scrubb_love.png' }, 
    Ocula: { name: 'an Ocula', asset: 'icon_ocula_love.png' }, 
    Vacrat: { name: 'a Vacrat', asset: 'icon_vacrat.png' }, 
    Lizumi: { name: 'a Lizumi', asset: 'icon_lizumi_wheelin.png' }, 
    FlipWhip: { name: 'a Flipwip', asset: 'icon_flipwip_hibernation.png' }, 
    FlapJack: { name: 'a Flapjack', asset: 'icon_flapjack_commuter.png' },
    Swoop: { name: 'a Swoopadoop', asset: 'icon_swoopadoop_fury.png' }, 
    Canoodle: { name: 'a Canoodle', asset: 'icon_canoodle_cruise.png' }, 
    Popjaw: { name: 'a Popjaw', asset: 'icon_popjaw_ponder.png' }, 
    Blopfish: { name: 'a Blopfush', asset: 'icon_blopfush_love.png' }, 
    Jabber: { name: 'a Jabber', asset: 'icon_jabber_aggro.png' }, 
    Peanut: { name: 'a Peanut', asset: 'icon_peanut_allergy.png' }, 
    
}
 

const QuizQuestions = [
    {
        Question: 'What do you want for christmas?',
        Answers: [
            { AnswerText: 'To go home', Results: { GROLD: 3 }},
            { AnswerText: 'A hotwheels car', Results: { Lizumi: 2 }},
            { AnswerText: 'A pogo stick', Results: { FlapJack: 1 }},
            { AnswerText: 'A pancake flipper', Results: { FlipWhip: 1 }},
            { AnswerText: 'A suction cleaning device', Results: { Vacrat: 1 }},
            { AnswerText: 'New glasses', Results: { Ocula: 2 }},
            { AnswerText: 'Happy Customers', Results: { GR: 1, MAYA: 1, Package: 1 }},
            { AnswerText: 'Friends', Results: { Blopfish: 1 }},
            { AnswerText: 'Death to all robots', Results: { Swoop: 1, Canoodle: 1, Popjaw: 1, Jabber: 1 }},
            { AnswerText: 'Peace and quiet', Results: { Peanut: 1, Scrubb: 1 }},
            { AnswerText: 'To make my owner happy', Results: { Package: 1 }},
        ]
    },
    {
        Question: 'If you could have 1 super power what would it be?',
        Answers: [
            { AnswerText: 'Teleportation', Results: { Popjaw: 1, }},
            { AnswerText: 'Flight', Results: { Swoop: 1, Blopfish: 1, Jabber: 1 }},
            { AnswerText: 'Super Speed', Results: { GR: 1, GROLD: 1, Lizumi: 1, }},
            { AnswerText: 'Super Smarts', Results: { MAYA: 1 }},
            { AnswerText: 'Super Cuteness', Results: { Blopfish: 1, Package: 1, }},
            { AnswerText: 'Super Strength', Results: { Scrubb: 1, Ocula: 1, Vacrat: 1, FlipWhip: 1, FlapJack: 1, Canoodle: 1, Peanut: 1 }},
        ]
    },
    {
        Question: 'What is your favorite Food?',
        Answers: [
            { AnswerText: 'Burritos', Results: { GR: 1, }},
            { AnswerText: 'Noodles', Results: { Canoodle: 2, }},
            { AnswerText: 'Robots', Results: { FlipWhip: 1, Swoop: 1, Popjaw: 1, Scrubb: 1, Vacrat: 1, FlapJack: 1, Jabber: 1, Ocula: 1, Lizumi: 1, Peanut: 1, Blopfish: 1 }},
            { AnswerText: 'Pancakes', Results: { FlipWhip: 1 }},
            { AnswerText: 'I don\'t eat', Results: { MAYA: 1, Package: 1, GROLD: 1 }},
        ]
    },
    {
        Question: 'You would be most hurt if a person called you',
        Answers: [
            { AnswerText: 'Slow', Results: { GR: 1, GROLD: 1, Lizumi: 1, }},
            { AnswerText: 'Dumb', Results: { MAYA: 1 }},
            { AnswerText: 'Overweight', Results: { Blopfish: 2 }},
            { AnswerText: 'Boring', Results: { Package: 1 }},
            { AnswerText: 'Weak', Results: { FlipWhip: 1, Swoop: 1, Popjaw: 1, Canoodle: 1, Scrubb: 1, Vacrat: 1, FlapJack: 1, Jabber: 1, Ocula: 1, Peanut: 1  }},
        ]
    },
    {
        Question: 'When I grow up I want to be',
        Answers: [
            { AnswerText: 'A delivery man', Results: { GR: 1, GROLD: 1 }},
            { AnswerText: 'Sentient', Results: { MAYA: 1, Package: 1 }},
            { AnswerText: 'A monster truck', Results: { Lizumi: 3 }},
            { AnswerText: 'The monopoly man', Results: { Ocula: 2 }},
            { AnswerText: 'A pancake chef', Results: { FlipWhip: 3 }},
            { AnswerText: 'An Assassin', Results: { Swoop: 1, Popjaw: 1, Canoodle: 1, Scrubb: 1,  FlapJack: 1, Jabber: 1 }},
            { AnswerText: 'A friend', Results: { Blopfish: 1, Peanut: 1 }},
            { AnswerText: 'A street sweeper', Results: { Vacrat: 1, }},
        ]
    },
    {
        Question: 'The most important quality in a significant other',
        Answers: [
            { AnswerText: 'Punctuality', Results: { GR: 1, GROLD: 1, Package: 1 }},
            { AnswerText: 'Brains', Results: { MAYA: 1 }},
            { AnswerText: 'Strength', Results: { Scrubb: 1, Ocula: 1, FlapJack: 1, Popjaw: 1 }},
            { AnswerText: 'Kindness', Results: { Blopfish: 1 }},
            { AnswerText: 'Anger', Results: { Swoop: 1, Lizumi: 1, Canoodle: 1, Jabber: 1 }},
            { AnswerText: 'Independence', Results: { Peanut: 2 }},
            { AnswerText: 'Cleanliness', Results: { Vacrat: 1 }},
            { AnswerText: 'Ability to do a backflip', Results: { Vacrat: 1 }},
        ]
    },
    {
        Question: 'Someone just jumped on your head!',
        Answers: [
            { AnswerText: 'Better lay down hopefully nobody picks me up', Results: { Scrubb: 2, Ocula: 2 }},
            { AnswerText: 'I\'m SO ANGRY', Results: { MAYA: 1, Swoop: 1,  Jabber: 1, Vacrat: 1, Lizumi: 1, Canoodle: 1, FlipWhip: 1, FlapJack: 1, Popjaw: 1, Peanut: 1 }},
            { AnswerText: 'It\'s cool I guess.', Results: { Package: 1, GROLD: 1, GR: 1, Blopfish: 1 }},
        ]
    },
    {
        Question: 'While standing at the edge of a canyon you have what thought while trying to get to the other side?',
        Answers: [
            { AnswerText: 'JUMP IT', Results: { GR: 1, FlapJack: 1, Popjaw: 1 }},
            { AnswerText: 'Fly over', Results: { Swoop: 1, Blopfish: 1, Jabber: 1 }},
            { AnswerText: 'Run off', Results: {  Ocula: 2, Peanut: 2, Lizumi: 1 }},
            { AnswerText: 'Guess I live here now', Results: { GROLD: 1, Package: 1, Scrubb: 1, Vacrat: 1, FlipWhip: 1, Canoodle: 1,  MAYA: 1 }},
        ]
    },
    {
        Question: 'You see a package on the ground, what do you do?',
        Answers: [
            { AnswerText: 'Deliver it', Results: { GR: 1, GROLD: 1, MAYA: 1 }},
            { AnswerText: 'Steal it', Results: { Lizumi: 1, FlapJack: 1, Popjaw: 1, Jabber: 1  }},
            { AnswerText: 'What is a package?', Results: { Scrubb: 1, Ocula: 1, Vacrat: 1, Swoop: 1, Canoodle: 1, Blopfish: 1, Peanut: 1 }},
            { AnswerText: 'Love it like a brother', Results: { Package: 1 }},
            { AnswerText: 'FLIP IT', Results: { FlipWhip: 3 }},
        ]
    },
    {
        Question: 'My Spirit animal is',
        Answers: [
            { AnswerText: 'A Goose', Results: { Swoop: 1, Canoodle: 1, Jabber: 1 }},
            { AnswerText: 'A Sea Urchin', Results: { Peanut: 1, Lizumi: 1  }},
            { AnswerText: 'A Border Collie', Results: { MAYA: 1 }},
            { AnswerText: 'A Rat with a vaccum cleaner', Results: { Vacrat: 1 }},
            { AnswerText: 'A Kangaroo', Results: { FlapJack: 1 }},
            { AnswerText: 'A Spatula', Results: { FlipWhip: 1 }},
            { AnswerText: 'A Great White Mecha-Shark', Results: { Popjaw: 2 }},
            { AnswerText: 'A Box', Results: { Package: 1 }},
            { AnswerText: 'A golden retreiver', Results: { GR: 1, GROLD: 1 }},
            { AnswerText: 'A tennis ball', Results: { Scrubb: 1, Ocula: 1, Blopfish: 1 }},
        ]
    },
    {
    Question: 'Your favorite weekend activity is',
    Answers: [
        { AnswerText: 'Providing value to the customer', Results: { GR: 1, GROLD: 1, MAYA: 2 }},
        { AnswerText: 'Hiding in the trees', Results: { GROLD: 1, Package: 1 }},
        { AnswerText: 'Walking back and forth', Results: { Ocula: 1, Peanut: 1, Lizumi: 1, Scrubb: 1, Canoodle: 1, Popjaw: 1  }},
        { AnswerText: 'Vacuuming', Results: { Vacrat: 3 }},
        { AnswerText: 'Sleeping', Results: { Popjaw: 1, Vacrat: 1, FlipWhip: 1 }},
        { AnswerText: 'Playing jump rope', Results: { FlapJack: 2 }},
        { AnswerText: 'Flipping stuff\'', Results: { FlipWhip: 1 }},
        { AnswerText: 'Flying', Results: { Swoop: 1, Blopfish: 1, Jabber: 1 }},
    ]
    },
]

export default class Quiz extends Component {
    constructor(props){
        super(props);

        this.state = {
            quizStared: false,
            quizQuestion: 0,
            results: {}
        }
    }

    startQuiz = () => {
        this.setState({ 
            quizStared: true, 
            quizQuestion: 0,
            results: {}
        });
    }

    onAnswerSelected = (answer) => {
        let results = _.cloneDeep(this.state.results);

        for(let f in answer.Results) {
            if(!results[f]) {
                results[f] = 0;
            }
            results[f] += answer.Results[f];
        }

        this.setState({
            results,
            quizQuestion: this.state.quizQuestion + 1
        })
    }

    getQuizResult = () => {
        let max = 0;
        let bestResult = null;
        for(let f in this.state.results) {
            if(this.state.results[f] > max) {
                max = this.state.results[f];
                bestResult = f;
            }
        }

        return options[bestResult];
    }

    render() {

        const quizRunning = this.state.quizStared && this.state.quizQuestion < QuizQuestions.length;
        const quizOver = this.state.quizStared && this.state.quizQuestion >= QuizQuestions.length;
        let quizResult;

        if(quizOver) {
            quizResult = this.getQuizResult();
        }

        return <div className="card" style={{ minHeight: '1000px' }}>
            <ColumnContainer>
                { !this.state.quizStared &&
                    <>
                        <Title>What Levelhead character are you?</Title>
                        <RowContainer>
                            <ColumnContainer>
                                <img src='/assets/levelhead/icon_peanut_allergy.png' />
                                <img src='assets/levelhead/icon_flipwip_hibernation.png' />
                            </ColumnContainer>
                            <ColumnContainer>
                                <img src='assets/levelhead/icon_gr-17_sadness.png' />
                                <img src='assets/levelhead/icon_maya.png' />
                            </ColumnContainer>
                        </RowContainer>
                        <ActionButton onClick={this.startQuiz}>Find Out!</ActionButton>
                    </>
                }
                {
                    quizRunning &&
                    <>
                        <QuizQuestion 
                            question={QuizQuestions[this.state.quizQuestion].Question}
                            answers={QuizQuestions[this.state.quizQuestion].Answers}
                            selectedAnswer={this.onAnswerSelected}
                        />
                    </>
                }
                {
                    quizOver &&
                    <>
                        <Title>You are {quizResult.name}!</Title>
                        <img src={`/assets/levelhead/${quizResult.asset}`} />
                        <ActionButton onClick={this.startQuiz}>Start Again</ActionButton>
                    </>
                }
            </ColumnContainer>
        </div>
    }
}